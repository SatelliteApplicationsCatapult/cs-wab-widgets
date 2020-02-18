define(["dojo/_base/declare",
    "dojo/_base/array",
    "dojo/date/locale",
    "dojo/dom-class",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    'dojo/Evented',
    "dojo/text!./ProductCard.html",
    "./util",
    "./RequestForm"
  ],
  function(declare, array, locale, domClass, _WidgetBase, _TemplatedMixin,
           Evented, _WidgetsInTemplateMixin, template, util, RequestForm) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {

      templateString: template,

      name: null,
      display_name: null,
      description: null,
      args: null,
      formPane: null,

      selected: false,

      requestForm: null,

      postCreate: function() {
        this.inherited(arguments);
      },

      startup: function() {
        if (this._started) {
          return;
        }
        this.inherited(arguments);
        this.render();
      },

      selectClicked: function() {

        if (this.selectButton.disabled) {
          return;
        }
        this.selectButton.disabled = true;
        this.selected = true;
        this.emit('on-product-selected', {name: this.name});

        this.addForm();
      },

      addForm: function() {
        // if (this.formPane.domNode.childElementCount !== 0){
        //   console.log(this.formPane.domNode.firstChild);
        //   this.formPane.domNode.removeChild(this.formPane.domNode.firstChild);
        // }
        this.requestForm = new RequestForm({
          name: this.name,
          args: this.args,
          map: this.map
        });

        this.requestForm.placeAt(this.formPane);
      },

      render: function() {
        this._renderThumbnail();
        util.setNodeText(this.titleNode, this.display_name);
        util.setNodeTitle (this.titleNode, this.display_name);
      },

      _renderThumbnail: function() {
        var nd = this.thumbnailNode;
        nd.innerHTML = "";
        var thumbnail = document.createElement("IMG");
        thumbnail.src = "widgets/ODCRequest/images/placeholder_120x80.png";
        nd.appendChild(thumbnail);
      },

      unselect: function(){
        if(this.selected){
          this.selected = false;
          this.selectButton.disabled = false;
        }
      }

    });

  });
