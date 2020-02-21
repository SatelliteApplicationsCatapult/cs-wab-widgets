define(["dojo/_base/declare",
    "dojo/_base/array",
    "dojo/date/locale",
    "dojo/dom-class",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./Submit.html",
    "dijit/ProgressBar",
    "dojo/dom-construct"
  ],
  function(declare, array, locale, domClass, _WidgetBase, _TemplatedMixin,
           _WidgetsInTemplateMixin, template, ProgressBar, domConstruct) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

      templateString: template,

      display_name: null,
      estimatedTime: null,

      postCreate: function() {
        this.inherited(arguments);

        domConstruct.create("p", {
          innerHTML: "Your product is being processed. Please, wait",
          style: "padding: 1em"},
          this.domNode);

        var myProgressBar = new ProgressBar({
          style: "width: 100%"
        });

        myProgressBar.placeAt(this.domNode);

        var i = 0;
        setInterval(function(){
          myProgressBar.set("value", i++ % 100);
        }, 100);

      },

      startup: function() {
        if (this._started) {
          return;
        }
        this.inherited(arguments);
      }

    });

  });
