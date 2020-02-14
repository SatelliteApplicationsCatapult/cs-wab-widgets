define(["dojo/_base/declare",
    "dojo/_base/array",
    "dojo/date/locale",
    "dojo/dom-class",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./RequestForm.html",
    "dijit/form/DateTextBox",
    "dijit/form/Textarea",
    "dijit/form/Button"
  ],
  function(declare, array, locale, domClass, _WidgetBase, _TemplatedMixin,
           _WidgetsInTemplateMixin, template, DateTextBox, Textarea, Button) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

      templateString: template,

      name: null,
      args: null,
      formPane: null,

      postCreate: function() {
        this.inherited(arguments);
      },

      startup: function() {
        if (this._started) {
          return;
        }
        this.inherited(arguments);
        console.log("RequestForm.startup", this);

        for (const arg of this.args){
          var element = this._createElementByType(arg.type);
          this.domNode.appendChild(document.createTextNode(arg.name));
          this.domNode.appendChild(element.domNode);
        }

        var button = new Button({
          label: "Submit",
          onClick: function(){
            console.log("This button works!");
          }
        });

        this.domNode.appendChild(button.domNode);

      },

      requestClicked: function() {
        console.log("RequestForm.requestClicked", this);
      },

      _createElementByType: function(type){
        if (type.includes("date")){
          return new DateTextBox({});
        }else{
          return new Textarea({});
        }

      }

    });

  });
