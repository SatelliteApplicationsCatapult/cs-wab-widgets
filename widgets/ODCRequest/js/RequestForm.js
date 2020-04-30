define(["dojo/_base/declare",
    "dojo/_base/array",
    "dojo/date/locale",
    "dojo/dom-class",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./RequestForm.html",
    "dijit/form/DateTextBox",
    "dijit/form/Select",
    "dijit/form/NumberSpinner",
    "dijit/form/Button",
    "esri/toolbars/draw",
    "esri/symbols/SimpleFillSymbol",
    "esri/graphic",
    "esri/geometry/webMercatorUtils",
    'dojo/_base/lang',
    "dojo/dom-construct",
    "./Submit",
    "dijit/form/ValidationTextBox"
  ],
  function(declare, array, locale, domClass, _WidgetBase, _TemplatedMixin,
           _WidgetsInTemplateMixin, template, DateTextBox, Select, NumberSpinner,
           Button, Draw, SimpleFillSymbol, Graphic, webMercatorUtils, lang, domConstruct,
           SubmitTemplate, ValidationTextBox) {

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

        for (const arg of this.args){
          // Create label for given input
          var div = domConstruct.create("div", {class: 'form-input', id: arg.name});
          domConstruct.create("label", { innerHTML: arg.display_name, for: arg.name, title:arg.description}, div);
          domConstruct.place(this._createElementByType(arg).domNode, div);
          domConstruct.place(div, this.odcForm.domNode);
        }

        this._addAoiSelectorTools(this.odcForm.domNode);

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

        //TODO: Send values to ODC backend API
        var validResponse = true; // emulates valid response

        if (validResponse){

          // Select the Submit tab panel automatically
          this.tabContainer.selectTab('Submit Pane');

          this.submitTemplate = new SubmitTemplate({
            display_name: this.display_name,
            estimatedTime: 0
          });

          this.submitTemplate.placeAt(this.tabContainer.tabs[2].content);

          // Unlock Submit Pane tab selection after selecting product
          this.tabContainer.tabItems
            .find(tab => tab.title === 'Submit Pane')
            .style.pointerEvents = "";

          // Block tab selection for Form and Select Pane
          this.tabContainer.tabItems
            .find(tab => tab.title === 'Form Pane')
            .style.pointerEvents = 'none';

          this.tabContainer.tabItems
            .find(tab => tab.title === 'Select Pane')
            .style.pointerEvents = 'none';

        }

      },

      _createElementByType: function(arg){

        if (arg.type === "date"){
          var datebox = new DateTextBox({
            name: arg.name,
            message: arg.description,
            required: true
          });

          datebox.constraints.datePattern = 'dd-MM-yyyy';

          return datebox;
        }
        else if(arg.type === "str") {
          if (arg.valid_values.length === 0){
            return new ValidationTextBox({
              name: arg.name,
              required: true
            });
          }
          else{
            // if valid_values list is not empty
            // creates a dropdown list with the
            // values given in it.
            var options = [];

            for (const value of arg.valid_values){
              options.push({label: value, value: value})
            }

            return new Select({
              name: arg.name,
              required: true,
              options: options
            });
          }
        }
        else if (arg.type === "int") {

          var constraints = {};
          var value = 0;

          if (arg.valid_values.length !== 0){
            constraints = {
              min:arg.valid_values[0],
              max:arg.valid_values[1],
              places:0
            };
            value = arg.valid_values[0];
          }

          return new NumberSpinner({
            name: arg.name,
            required: true,
            value: value,
            constraints: constraints,
            smallDelta: 1
          });
        }
        else if (arg.type === "wkt"){

          this.wktArea = new ValidationTextBox({
            name: arg.name,
            required: true,
            regExp: "POLYGON\\(\\(((-?\\d+\\.\\d+ -?\\d+\\.\\d+),?)+\\)\\)+",
            invalidMessage:'Introduce a valid WKT string or use Select AOI tool'
          });

          return this.wktArea;
        }
      },

      _addAoiSelectorTools: function (domNode){

        domNode.appendChild(new Button({
          label: "Select AOI",
          onClick: lang.hitch(this, this.selectAoi)
        }).domNode);

        domNode.appendChild(new Button({
          label: "Clear AOI",
          onClick: lang.hitch(this, this.clearAoi)
        }).domNode);

      },

      selectAoi: function () {
        if(!this._aoiGraphic && !this._drawAoi){
          this._drawAoi = new Draw(this.map);
          this._drawAoi.on("draw-end", lang.hitch(this, this._addToMap));
          this._drawAoi.activate(Draw.RECTANGLE);
        }
      },

      _addToMap: function (evt) {
        this._drawAoi.deactivate();
        this._aoiGraphic = new Graphic(evt.geometry, new SimpleFillSymbol());
        this.map.graphics.add(this._aoiGraphic);
        this._drawAoi.finishDrawing();
        this._drawAoi = null;
        var coord = webMercatorUtils.webMercatorToGeographic(evt.geometry);
        this.wktArea.set('value', this._esriGeometryToWkt(coord));
      },

      _esriGeometryToWkt: function (geometry){
        if(geometry.type === 'polygon'){
          var wkt = "POLYGON((";
          geometry.rings[0].forEach(function (point) {
            wkt = wkt.concat(point[0].toString(), ' ', point[1].toString(), ',');
          });
          wkt = wkt.replace(/.$/,"))");
          return wkt;
        }
      },

      clearAoi: function () {
        this.map.graphics.remove(this._aoiGraphic);
        this._aoiGraphic = null;
        this.wktArea.set('value', "");
      }

    });

  });
