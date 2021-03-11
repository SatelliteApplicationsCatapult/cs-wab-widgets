define(["dojo/_base/declare",
    "dojo/_base/array",
    "dojo/date/locale",
    "dojo/dom-class",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./Submit.html",
    "dojo/dom-construct"
  ],
  function(declare, array, locale, domClass, _WidgetBase, _TemplatedMixin,
           _WidgetsInTemplateMixin, template, domConstruct) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

      templateString: template,

      display_name: null,
      estimatedTime: null,
      message: null,

      postCreate: function() {
        this.inherited(arguments);

        domConstruct.create("p", {
          innerHTML: `✔ Your ${this.display_name} product is being processed. (${this.message})`,
          style: "padding: 0.5em"},
          this.domNode);

      },

      startup: function() {
        if (this._started) {
          return;
        }
        this.inherited(arguments);
      }

    });

  });
