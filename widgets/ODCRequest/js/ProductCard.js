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
        this.render();
      },

      startup: function() {
        if (this._started) {
          return;
        }
        this.inherited(arguments);
      },



      selectClicked: function() {

        if (this.selectButton.disabled) {
          return;
        }

        this.selectButton.style.color = "#898989";
        this.selectButton.style.cursor = "not-allowed";
        this.itemCard.style.background = "#eeeeee08";

        this.selectButton.disabled = true;
        this.selected = true;
        this.emit('on-product-selected', {name: this.name});

        this.addForm();
      },

      addForm: function() {
        this.requestForm = new RequestForm({
          name: this.name,
          display_name: this.display_name,
          args: this.args,
          map: this.map
        });
        this.requestForm.placeAt(this.formPane);
      },

      render: function() {
        this._renderThumbnail();
        util.setNodeText(this.titleNode, this.display_name);
        util.setNodeTitle (this.titleNode, this.display_name);

        util.setNodeText(this.descriptionNode, this.description);
        util.setNodeTitle(this.descriptionNode, this.description);
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
          this.selectButton.style.color = "";
          this.selectButton.style.cursor = "";
          this.itemCard.style.background = "";
        }
      }

    });

  });
