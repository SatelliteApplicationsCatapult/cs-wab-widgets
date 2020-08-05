define([
    'dojo/_base/declare',
    'jimu/BaseWidget',
    'dojo/_base/lang',
    "dojo/parser",
    'dojo/on',
    "dijit/layout/BorderContainer",
    "dijit/layout/TabContainer",
    "dijit/layout/ContentPane",
    "esri/layers/GraphicsLayer",
    "dijit/form/DateTextBox",
    "dijit/form/Textarea",
    "dijit/form/Button",
    "dijit/_WidgetsInTemplateMixin",
    "./js/ProductCard",
    "jimu/dijit/TabContainer3",
    "./js/ErrorTemplate",
    "dojo/dom-construct"
    ],
function(declare, BaseWidget, lang, parser, on, BorderContainer, TabContainer, ContentPane,
         GraphicsLayer, DateTextBox, Textarea, Button, _WidgetsInTemplateMixin, ProductCard,
         TabContainer3, ErrorTemplate, domConstruct) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget, _WidgetsInTemplateMixin], {

    // Custom widget code goes here

    baseClass: 'odc-request',
    // this property is set by the framework when widget is loaded.
    // name: 'ODCRequest',
    // add additional properties here

    productCardList: [],

    //methods to communication with app container:
    postCreate: function() {
      this.inherited(arguments);
      console.log('ODCRequest::postCreate');
    },

    startup: function() {
      this.inherited(arguments);
      console.log('ODCRequest::startup');

      this.selectPaneTab = {
        title: "Select Pane",
        content: this.selectPane
      };
      this.formPaneTab = {
        title: "Form Pane",
        content: this.formPane
      };
      this.submitPaneTab = {
        title: "Submit Pane",
        content: this.submitPane
      };

      this.tabContainer = new TabContainer3({
        average: true,
        tabs:[
          this.selectPaneTab,
          this.formPaneTab,
          this.submitPaneTab
        ]
      }, this.tabsNode);

      // Block tab selection for Form and Submit Pane
      this.tabContainer.tabItems
        .find(tab => tab.title === 'Form Pane')
        .style.pointerEvents = 'none';

      this.tabContainer.tabItems
        .find(tab => tab.title === 'Submit Pane')
        .style.pointerEvents = 'none';

      var newRequestButton = new Button({
        label: '↩ Request another product',
        onClick: lang.hitch(this, this.newRequestSubmit)
      });

      newRequestButton.placeAt(this.submitPane);

      var modifyRequestButton = new Button({
        label: 'Modify request',
        onClick: lang.hitch(this, this.modifyRequestSubmit)
      });

      modifyRequestButton.placeAt(this.submitPane);

      this.createSelectProductPane();
    },

    onOpen: function(){
      console.log('ODCRequest::onOpen');
    },

    createSelectProductPane: function () {

      var token_url = new URL(this.config.cubequeryUrl + '/token');

      fetch(token_url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name:this.config.cubequeryName,
          pass:this.config.cubequeryPass
        })
      })
      .then((response) => {
        return response.json();
      })
      .then((data) => {

        this.apiToken = data.token;
        var describe_url = new URL(this.config.cubequeryUrl + '/describe');
        describe_url.searchParams.append('APP_KEY', this.apiToken);

        fetch(describe_url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then((response) => {
          return response.json();
        })
        .then((data) => {

          for (const product of data){
            var productCard = new ProductCard({
              name: product.name,
              display_name: product.display_name,
              description: product.description,
              args: product.args,
              formPane: this.formPane,
              map: this.map,
              tabContainer: this.tabContainer,
              config: this.config,
              apiToken: this.apiToken
            });

            productCard.placeAt(this.selectPane);
            productCard.on('on-product-selected', lang.hitch(this, this._productSelectedOnChanged));

            this.productCardList.push(productCard);
          }
        })
      })
      .catch((error) => {
        this.errorTemplate = new ErrorTemplate({
          errorMessage: error,
          tabContainer: this.tabContainer,
        });

        this.errorTemplate.placeAt(this.selectPane);
      });
    },

    _productSelectedOnChanged : function(evt) {

      // if any other product has been selected destroy the form and unselect it
      this.productCardList.forEach(function (productCard) {
        if(productCard.name !== evt.name && productCard.selected){
          productCard.requestForm.clearAoi();
          productCard.requestForm.destroy();
          productCard.unselect();
        }
      });

      // Select the form tab panel automatically
      this.tabContainer.selectTab(this.formPaneTab.title);

      // Unlock Form Pane tab selection after selecting product
      this.tabContainer.tabItems
        .find(tab => tab.title === 'Form Pane')
        .style.pointerEvents = "";
    },

    newRequestSubmit: function(evt) {
      // destroy the form and unselect it
      this.productCardList.forEach(function (productCard) {
        if(productCard.selected){
          productCard.requestForm.clearAoi();
          productCard.requestForm.destroy();
          productCard.unselect();
        }
      });

      // Select the Select Pane tab automatically
      this.tabContainer.selectTab(this.selectPaneTab.title);

      // Lock Submit Pane tab
      this.tabContainer.tabItems
        .find(tab => tab.title === 'Submit Pane')
        .style.pointerEvents = 'none';
    },

    modifyRequestSubmit: function(evt) {
      // Select the Form Pane tab automatically
      this.tabContainer.selectTab('Form Pane');

      // unlock Select Pane tab
      this.tabContainer.tabItems
        .find(tab => tab.title === 'Select Pane')
        .style.pointerEvents = '';

      // unlock Form Pane tab
      this.tabContainer.tabItems
      .find(tab => tab.title === 'Form Pane')
      .style.pointerEvents = '';

      // Lock Submit Pane tab
      this.tabContainer.tabItems
        .find(tab => tab.title === 'Submit Pane')
        .style.pointerEvents = 'none';
    }

    // onClose: function(){
    //   console.log('ODCRequest::onClose');
    // },

    // onMinimize: function(){
    //   console.log('ODCRequest::onMinimize');
    // },

    // onMaximize: function(){
    //   console.log('ODCRequest::onMaximize');
    // },

    // onSignIn: function(credential){
    //   console.log('ODCRequest::onSignIn', credential);
    // },

    // onSignOut: function(){
    //   console.log('ODCRequest::onSignOut');
    // }

    // onPositionChange: function(){
    //   console.log('ODCRequest::onPositionChange');
    // },

    // resize: function(){
    //   console.log('ODCRequest::resize');
    // }

    //methods to communication between widgets:

  });

});
