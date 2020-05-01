define(["dojo/_base/declare",
    "dojo/_base/array",
    "dojo/date/locale",
    "dojo/dom-class",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./SubmitError.html",
    "dijit/ProgressBar",
    "dojo/dom-construct"
  ],
  function(declare, array, locale, domClass, _WidgetBase, _TemplatedMixin,
           _WidgetsInTemplateMixin, template, ProgressBar, domConstruct) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

      templateString: template,

      errorMessage: null,
      tabContainer: null,
      actionElement: null,

      postCreate: function() {
        this.inherited(arguments);

        domConstruct.create(
          "img",
          {
            src: "widgets/ODCRequest/images/icon_sad.png",
          },
          this.domNode
        );

        domConstruct.create(
          "h2",
          {
            innerHTML: "Oops! Something went wrong",
          },
          this.domNode
        );

        domConstruct.create(
          "p",
          {
            innerHTML: this.errorMessage,
          },
          this.domNode
        );

        if(this.actionElement){
          domConstruct.place(this.actionElement, this.domNode);
        }

      },

      startup: function() {
        if (this._started) {
          return;
        }
        this.inherited(arguments);
      }

    });

  });
