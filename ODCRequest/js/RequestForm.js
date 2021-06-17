var date_objects = []

define(["dojo/_base/declare",
    "dojo/date/locale",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./RequestForm.html",
    "dijit/form/DateTextBox",
    "dijit/form/Select",
    "dijit/form/NumberSpinner",
    "dijit/form/Button",
    "dijit/form/MultiSelect",
    "esri/toolbars/draw",
    "esri/symbols/SimpleFillSymbol",
    "esri/graphic",
    "esri/geometry/webMercatorUtils",
    'dojo/_base/lang',
    "dojo/dom-construct",
    "./Submit",
    "dijit/form/ValidationTextBox",
    "./SubmitError",
    "dijit/Dialog",
    "dijit/form/NumberTextBox"
  ],
  function (declare, locale, _WidgetBase, _TemplatedMixin,
            _WidgetsInTemplateMixin, template, DateTextBox, Select, NumberSpinner,
            Button, MultiSelect, Draw, SimpleFillSymbol, Graphic, webMercatorUtils,
            lang, domConstruct, Submit, ValidationTextBox, SubmitError, Dialog,
            NumberTextBox) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

      templateString: template,

      name: null,
      display_name: null,
      args: null,
      map: null,
      tabContainer: null,

      _aoiGraphic: null,
      _drawAoi: null,

      postCreate: function() {
        this.inherited(arguments);
        this._createInputFields();
      },

      _createInputFields: function() {

        this._addAoiSelectorTools(this.odcForm.domNode);

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        date_objects = []

        try {
          for (var _iterator = this.args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var arg = _step.value;

            // Multi selector is not given enough height by default
            if (arg.type == 'multi') {
              class_list = 'form-input multi'
            } else {
              class_list = 'form-input'
            }
            // Create label for given input
            var div = domConstruct.create("div", {
              class: class_list,
              id: arg.name
            });
            domConstruct.create("label", {
              innerHTML: arg.display_name,
              for: arg.name,
              title: arg.description,
              class:'form_label',
            }, div);
            domConstruct.place(this._createElementByType(arg).domNode, div);
            domConstruct.place(div, this.odcForm.domNode);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this._initialiseDynamicForm()

        var submitButton = new Button({
          label: 'Submit Form',
          form: 'odc-form',
          onClick: lang.hitch(this, this.checkFormValues)
        });

        submitButton.placeAt(this.odcForm.domNode);
      },

      startup: function() {
          
        if (this._started) {
          return;
        }
        this.inherited(arguments);
      },

      checkFormValues: function() {
        if (this.odcForm.validate()){
          this.sendValues(dojo.formToJson(this.odcForm.id));
        }
      },

      sendValues: function(values){
        active_alerts = document.getElementsByClassName('alert_box')
        while (active_alerts.length > 0) {
          active_alerts[0].parentNode.removeChild(active_alerts[0]);
        }

        var _this = this;

        var task_url = new URL(this.config.cubequeryUrl + '/task');
        task_url.searchParams.append('APP_KEY', this.apiToken);

        fetch(task_url, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            task: this.name,
            args: JSON.parse(values)
          })
        }).then(function (response) {
          if (response['status'] == 200) {
            return response.text().then(function (data) {
              _this._createSuccessfulMessage(data);
            }).catch(function (error) {
              _this._createErrorMessage(error);
            })
          } else {
            return response.text().then(function (data) {
              var error = JSON.parse(data);
              full_error_message = ''

              error.forEach(function (e) {
                full_error_message = full_error_message + e.Error + '<br><br>'
                _this._addAlertBox(e.Error);
              });

              _this._createErrorAlert(full_error_message)

            })
          }
        })


        // Unlock Submit tab selection after selecting product
        this.tabContainer.tabItems.find(function (tab) {
          return tab.title === 'Submit';
        }).style.pointerEvents = "";
      },

      _createSuccessfulMessage: function(message) {
        // Select the Submit tab panel automatically
        this.tabContainer.selectTab('Submit');

        let success_message = dijit.byId('success_message')
        if (success_message) {
          success_message.destroy()
        }

        this.submitTemplate = new Submit({
          display_name: this.display_name,
          estimatedTime: 0,
          message: message,
          id: 'success_message'
        });

        this.submitTemplate.placeAt(this.tabContainer.tabs[2].content);

      },

      _createErrorMessage: function(message) {
        this.tabContainer.selectTab('Submit');
        this.errorTemplate = new SubmitError({
          errorMessage: message,
          display_name: this.display_name
        });

        this.errorTemplate.placeAt(this.tabContainer.tabs[2].content);
      },

      _createErrorAlert: function(error) {
        alert_dialog = new Dialog({
          title: "Request could not be processed",
          content: error,
          style: "width: 400px"
        });
        alert_dialog.show()
      },

      checkDatePosition: function () {
        const date_pairs = {
          'time_start': 'time_end',
          'analysis_time_start': 'analysis_time_end',
          'baseline_time_start': 'baseline_time_end'
        }

        date_objects.forEach(function (e) {
          let id = e.id
          if (id in date_pairs) {
            let start_result = e.displayedValue
            let end_date = date_objects.filter(date => date.id === date_pairs[id])
            let end_result = end_date[0].displayedValue
            if (start_result && end_result) {
              if (start_result > end_result) {
                end_date[0].setValue(start_result)
              }
            }
          }
        })
      },

      checkYearPosition: function(e) {
        if (e > 1000) {
          this.value = 292
          this.displayedValue = 292
          this._resetValue()
        }
      },

      _createElementByType: function(arg) {
        var process_name = this.name

        if (arg.type === "year") {
            const year = new Date().getFullYear()
            let constraints = {
              min: "1975",
              max: year,
              places: 0,
              pattern: '#'
            };

            return new NumberSpinner({
              name: arg.name,
              required: true,
              value: year,
              onChange: this.checkYearPosition, 
              constraints: {
                min: 1975,
                max: year,
                places: 0,
                pattern: '#'
              },
              smallDelta: 1,
              id: arg.name,
            });
        }

        if (arg.type === "date") {
            
          var datePattern = 'yyyy-MM-dd';
          var datebox = new DateTextBox({
            id: arg.name,
            name: arg.name,
            onChange: this.checkDatePosition,
            message: arg.description,
            required: true,
            tooltipPosition: ["above","after","before"],
            constraints: {
              datePattern: datePattern,
              max: new Date().toISOString().split('T')[0]
            },
            serialize: function serialize(value, options) {
              return locale.format(value, {
                selector: 'date',
                datePattern: datePattern
              });
            },
          });

          date_objects.push(datebox)
          return datebox;

        } else if (arg.type === "str") {
          if (arg.valid_values.length === 0) {
            return new ValidationTextBox({
              name: arg.name,
              required: true,
              id: arg.name,
              tooltipPosition: ["above","after","before"]
            });
          } else {
            // if valid_values list is not empty
            // creates a dropdown list with the
            // values given in it.
            var options = [];
            var set_date_boundaries = this._setDateBoundaries
            var set_int_boundaries = this._setIntBoundaries
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = arg.valid_values[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var _value = _step2.value
                var _display = _step2.value

                if (typeof _value == 'object') {
                  _display = _value.display
                  _value = _value.value
                }

                options.push({
                  id: 'select_' + _value,
                  label: _display,
                  value: _value
                });
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }
            select_dom = new Select({
              name: arg.name,
              required: true,
              options: options,
              style: {
                width: '17.3em'
              },
              onChange: function (value) {
                if (arg.name == 'platform' || arg.name == 'baseline_platform') {
                  set_int_boundaries('platform', value, process_name)
                  set_date_boundaries('platform', value, process_name)
                }
              },
              id: arg.name
            });

            value = select_dom.value

            return select_dom
          }
        } else if (arg.type === "int") {
          var constraints = {};
          var value = 0;

          if (arg.valid_values.length !== 0) {
            constraints = {
              min: arg.valid_values[0],
              max: arg.valid_values[1],
              places: 0,
              pattern: '#'
            };
            value = arg.valid_values[0];
          }

          return new NumberSpinner({
            name: arg.name,
            required: true,
            value: value,
            constraints: constraints,
            smallDelta: 1,
            id: arg.name,
          });
        } else if (arg.type === "wkt") {

          this.wktArea = new ValidationTextBox({
            name: arg.name,
            required: true,
            regExp: "POLYGON\\s*\\(\\(((-?\\d+\\.\\d+ -?\\d+\\.\\d+),?\\s*)+\\)\\)+",
            invalidMessage: 'Introduce a valid WKT string or use Select AOI tool',
            id: arg.name,
            tooltipPosition: ["above","after","before"],
            onChange: dojo.hitch(this, function (value) {
              if (this._validatePolygon(value)) {
                this._drawInputPolygon(value)
              }
            })
          });

          return this.wktArea;

        } else if (arg.type === "multi") {
          var multi_select_element = document.createElement('select')
          for (var _iterator2 = arg.valid_values[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _value = _step2.value
            var _display = _step2.value

            if (typeof _value == 'object') {
              _display = _value.display
              _value = _value.value
            }

            var option_element = document.createElement('option')
            option_element.innerHTML = _display
            option_element.value = _value
            multi_select_element.appendChild(option_element)
          }
          return new MultiSelect({
            name: arg.name,
            style: {
              width: '210px'
            },
            id: arg.name,
            onChange: dojo.hitch(this, function (values) {
                if (arg.name=='platform') {
                    this._setMultiIntBoundaries(arg.name, values)
                    this._setMultiDateBoundaries(arg.name, values)
                }
            })
          }, multi_select_element)

        } else if (arg.type === 'float') {

          var constraints = {};
          var value = 0;

          if (arg.valid_values.length !== 0) {
            constraints = {
              min: arg.valid_values[0],
              max: arg.valid_values[1],
              pattern: '0.###'
            };
            value = arg.valid_values[0];
          }

          return new NumberTextBox({
            name: arg.name,
            required: true,
            constraints: constraints,
            id: arg.name,
          });

        }
      },

      _initialiseDynamicForm: function() {
        var set_date_boundaries = this._setDateBoundaries
        var set_int_boundaries = this._setIntBoundaries
        var set_multi_boundaries = this._setMultiIntBoundaries

        var process_name = this.name

        Object.keys(dynamic_settings).forEach(function (node_id) {

          var node = dijit.byId(node_id)

          if (!node && node_id == 'platform') {
            var node = dijit.byId('baseline_platform')
          }

          if (node) {
            value = node.get("value")

            if (!(Array.isArray(node.value))) {
              set_int_boundaries(node_id, value, process_name)
              set_date_boundaries(node_id, value, process_name)
            } else {
              set_multi_boundaries(node_id, value, process_name)
            }
          }
        });

      },

      _setDateBoundaries: function(node_id, selected_option, process_name) {
        today = new Date().toISOString().split('T')[0]

        let key = dynamic_settings[node_id]
        key.forEach(function (e) {
          e.conditions.forEach(function (condition) {
            if (condition.type == 'date_range' && e.name == selected_option) {
              for (var i = 0; i < condition.id.length; i++) {

                if (condition.hasOwnProperty("processes")) {
                  if (condition.processes.includes(process_name)) {} else {
                    break;
                  }
                }

                let date_node = dijit.byId(condition.id[i])
                if (date_node) {
                  let values = condition.value
                  let constraints = date_node.attr("constraints")
                  constraints.min = values[0]
                  if (values.length > 1) {
                    constraints.max = values[1]
                  } else {
                    constraints.max = today
                  }
                  date_node.attr("constraints", constraints)
                  
                  /*
                  if (date_node.value != null) {
                    date_node.attr("value", values[0])
                  }
                  */
                  
                }
              }
            }
          })
        })
      },

      // Need to set default int boundaries
      _setIntBoundaries: function(node_id, selected_option, process_name) {
        let key = dynamic_settings[node_id]
        key.forEach(function (e) {
          e.conditions.forEach(function (condition) {
            if (condition.type == 'int_range' && e.name == selected_option) {
              for (var i = 0; i < condition.id.length; i++) {

                if (condition.hasOwnProperty("processes")) {
                  if (condition.processes.includes(process_name)) {} else {
                    break;
                  }
                }

                let int_node = dijit.byId(condition.id[i])
                if (int_node) {
                  let values = condition.value
                  let constraints = int_node.attr("constraints")
                  constraints.min = Math.min(...values)
                  if (values.length > 1) {
                    constraints.max = Math.max(...values)
                  } else {
                    constraints.max = ''
                  }

                  int_node.attr("constraints", constraints)
                  int_node.attr("value", Math.min(...values))
                }
              }
            }
          })
        })
      },

      _setMultiIntBoundaries: function(node_id, values) {
        var min_value = 0
        var max_value = 0
        int_node = false

        let key = dynamic_settings[node_id]
        key.forEach(function (e) {
          e.conditions.forEach(function (condition) {
            if (condition.type == 'int_range' && values.includes(e.name)) {
              for (var i = 0; i < condition.id.length; i++) {
                int_node = dijit.byId(condition.id[i])

                if (condition.hasOwnProperty("processes")) {
                  if (condition.processes.includes(this.name)) {} else {
                    break;
                  }
                }
                let values = condition.value
                min_value_temp = Math.min(...values)
                max_value_temp = Math.max(...values)

                if (min_value_temp > min_value) {
                  min_value = min_value_temp
                }

                if (max_value_temp > max_value) {
                  max_value = max_value_temp
                }
                
              }
              if (int_node) {
                let constraints = int_node.attr("constraints")
                constraints.min = min_value
                if (values.length > 1) {
                  constraints.max = max_value
                } else {
                  constraints.max = ''
                }
                int_node.attr("constraints", constraints)
                int_node.attr("value", min_value)
              }
              
            }
          })
        })
      },

      _setMultiDateBoundaries: function(node_id, values) {
        today = new Date().toISOString().split('T')[0]

        var min_value = new Date('1990-01-01').toISOString().split('T')[0]
        var max_value = today
        date_nodes = []

        let key = dynamic_settings[node_id]
        key.forEach(function (e) {
          e.conditions.forEach(function (condition) {
            if (condition.type == 'date_range' && values.includes(e.name)) {
              for (var i = 0; i < condition.id.length; i++) {
                date_node_temp = dijit.byId(condition.id[i])
                if (date_node_temp) {
                  date_nodes.push(date_node_temp)
                }
                if (condition.hasOwnProperty("processes")) {
                  if (condition.processes.includes(this.name)) {} else {
                    break;
                  }
                }
                let values = condition.value
                
                if (date_node_temp) {
                  min_value_temp = new Date(values[0]).toISOString().split('T')[0]
                  if (values.length > 1) {
                    max_value_temp = new Date(values[1]).toISOString().split('T')[0]
                  } else {
                    max_value_temp = ''
                  }                  
                  if (min_value_temp > min_value) {
                    min_value = min_value_temp
                  }
                  if (max_value_temp) {
                    if (max_value_temp < max_value) {
                      max_value = max_value_temp
                    }
                  }
                }
              }
              if (date_nodes) {
                for (var i=0; i<date_nodes.length;i++) {
                  let constraints = date_nodes[i].attr("constraints")
                  constraints.min = min_value
                  if (max_value) {
                    constraints.max = max_value
                  } else {
                    constraints.max = ''
                  }
                  date_nodes[i].attr("constraints", constraints)
                  //date_nodes[i].attr("value", min_value)
                }
              }
            }
          })
        })
      },

      _addAoiSelectorTools: function(domNode) {
        domConstruct.create("label", {
            innerHTML: this.params.display_name,
            class:'form_title',
          }, domNode);
          
        domNode.appendChild(new Button({
          label: "Select AOI",
          onClick: lang.hitch(this, this.selectAoi)
        }).domNode);

        domNode.appendChild(new Button({
          label: "Clear AOI",
          onClick: lang.hitch(this, this.clearAoi)
        }).domNode);
      },

      _addAlertBox: function(message) {
        var alert_box = document.getElementById("alert_box");
        if (!alert_box) {
          message = '<h3>Request could not be processed</h3><br>' + message
        }
        var div = domConstruct.create("div", {
          id: 'alert_box',
          class: 'alert_box',
          style: 'width: 100%;text-align: center;background-color: #fff1df;padding: 0.7em;'
        })
        domConstruct.create("label", {
          innerHTML: message,
          title: 'Alert'
        }, div)
        domConstruct.place(div, this.odcForm.domNode)
      },

      _drawInputPolygon: function(wkt) {
        this.map.graphics.clear();
        this._aoiGraphic = null;
        let rings = this._wktToEsriGeometry(wkt)
        var aoiGraphic = {
          "geometry": {
            "rings": [
              rings
            ],
            "spatialReference": {
              "wkid": 4326
            }
          },
          "symbol": {
            "color": [100, 50, 20, 64],
            "outline": {
              "color": [0, 0, 0, 255],
              "width": 1,
              "type": "esriSLS",
              "style": "esriSLSSolid"
            },
            "type": "esriSFS",
            "style": "esriSFSSolid"
          }
        };
        this._aoiGraphic = new Graphic(aoiGraphic);
        this.map.graphics.add(this._aoiGraphic)
      },

      _validatePolygon: function(polygon) {
        if (polygon.length > 10) {
          return true
        }
        return false
      },

      selectAoi: function() {
        if (!this._aoiGraphic && !this._drawAoi) {
          this._drawAoi = new Draw(this.map);
          this._drawAoi.on("draw-end", lang.hitch(this, this._addToMap));
          this._drawAoi.activate(Draw.RECTANGLE);
        }
      },

      _addToMap: function(evt) {
        this._drawAoi.deactivate();
        this._aoiGraphic = new Graphic(evt.geometry, new SimpleFillSymbol());
        this.map.graphics.add(this._aoiGraphic);
        this._drawAoi.finishDrawing();
        this._drawAoi = null;
        var coord = webMercatorUtils.webMercatorToGeographic(evt.geometry);
        this.wktArea.set('value', this._esriGeometryToWkt(coord));
      },

      _esriGeometryToWkt: function(geometry) {
        if (geometry.type === 'polygon') {
          var wkt = "POLYGON((";
          geometry.rings[0].forEach(function (point) {
            wkt = wkt.concat(point[0].toString(), ' ', point[1].toString(), ',');
          });
          wkt = wkt.replace(/.$/, "))");
          return wkt;
        }
      },

      // TODO: This is so hacky, I need to find a better way of doing this ... regular expression
      _wktToEsriGeometry: function(wkt) {
        wkt = wkt.replace('POLYGON', '')
        wkt = wkt.replace('((', '')
        wkt = wkt.replace('))', '')
        wkt = wkt.split(',');
        output = []
        wkt.forEach(function (e) {
          ring = []
          e = e.split(' ')
          e.forEach(function (i) {
            ring.push(parseFloat(i))
          })
          output.push(ring)
        })
        return output
      },

      clearAoi: function() {
        this.map.graphics.clear();
        this._aoiGraphic = null;
        if (this.wktArea) {
          this.wktArea.set('value', "");
        }
        
      }

    });
  });
