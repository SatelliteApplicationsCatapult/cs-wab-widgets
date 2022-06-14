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
        title: "Select",
        content: this.selectPane
      };
      this.formPaneTab = {
        title: "Options",
        content: this.formPane
      };
      this.submitPaneTab = {
        title: "Submit",
        content: this.submitPane
      };

      this.tabContainer = new TabContainer3({
        average: true,
        tabs: [this.selectPaneTab, this.formPaneTab, this.submitPaneTab]
      }, this.tabsNode);

      // Block tab selection for Form and Submit
      this.tabContainer.tabItems.find(function (tab) {
        return tab.title === 'Options';
      }).style.pointerEvents = 'none';

      this.tabContainer.tabItems.find(function (tab) {
        return tab.title === 'Submit';
      }).style.pointerEvents = 'none';

      var newRequestButton = new Button({
        label: '↩ Request another product',
        onClick: lang.hitch(this, this.newRequestSubmit)
      });

      this.apiToken = null;

      newRequestButton.placeAt(this.submitPane);

      this.createSelectProductPane();
    },

    onOpen: function() {
      console.log('ODCRequest::onOpen');
    },

    requestToken: async function() {
      let BASE_OPENPORTAL_URL = new URL(this.config.openportalUrl);
      let REQUEST_TOKEN_URL = BASE_OPENPORTAL_URL.origin + BASE_OPENPORTAL_URL.pathname + "request-token";

      let token = await fetch(REQUEST_TOKEN_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: this.config.openportalName,
          pass: this.config.openportalPass
        })
      })
      .then(function (response) {
        return response.json();
      }
      ).then(function (data) {
        return data.token;
      }
      ).catch(function (error) {
        console.log(error);
      }
      );
      return token;
    },

    refreshToken: async function() {
      let BASE_OPENPORTAL_URL = new URL(this.config.openportalUrl);
      let REFRESH_TOKEN_URL = BASE_OPENPORTAL_URL.origin + BASE_OPENPORTAL_URL.pathname + "refresh-token";
      
      let refreshedToken = await fetch(REFRESH_TOKEN_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: this.apiToken
        })
      })
      .then(function (response) {
        return response.json();
      }
      ).then(function (data) {
        return data.token;
      }
      ).catch(function (error) {
        console.log(error);
      }
      );

      return refreshedToken;
    },

    createSelectProductPane: async function() {
      var _this = this;
      let BASE_OPENPORTAL_URL = new URL(this.config.openportalUrl);

      let PRODUCT_ENDPOINT = BASE_OPENPORTAL_URL.origin + BASE_OPENPORTAL_URL.pathname + "fetch-products";

      this.apiToken = await _this.requestToken();

      // Refresh token every 5 minutes
      setInterval(async function() {
        let token = await _this.refreshToken(this.apiToken);
        this.apiToken = token;
      }
      , 300000);

      fetch(PRODUCT_ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: this.apiToken,
        })
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        dynamic_settings = data.settings
        result = data.result              
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {

          for (var _iterator = result[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var product = _step.value;
            var productCard = new ProductCard({
              name: product.name,
              display_name: product.display_name,
              description: product.description,
              args: product.args,
              formPane: _this.formPane,
              map: _this.map,
              tabContainer: _this.tabContainer,
              config: _this.config,
              apiToken: _this.apiToken,
              infoLink: product.info_url,
              thumbnail: product.img_url,
              dynamic_settings: dynamic_settings,
            });

            productCard.placeAt(_this.selectPane);
            productCard.on('on-product-selected', lang.hitch(_this, _this._productSelectedOnChanged));

            _this.productCardList.push(productCard);
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
      });
        
    },

    _productSelectedOnChanged: function(evt) {

      // if any other product has been selected destroy the form and unselect it
      this.productCardList.forEach(function (productCard) {
        if (productCard.name !== evt.name && productCard.selected) {
          productCard.requestForm.clearAoi();
          productCard.requestForm.destroy();
          productCard.unselect();
        }
      });

      // Select the form tab panel automatically
      this.tabContainer.selectTab(this.formPaneTab.title);

      // Unlock Options tab selection after selecting product
      this.tabContainer.tabItems.find(function (tab) {
        return tab.title === 'Options';
      }).style.pointerEvents = "";
    },

    newRequestSubmit: function(evt) {
      // destroy the form and unselect it
      this.productCardList.forEach(function (productCard) {
        if (productCard.selected) {
          productCard.requestForm.clearAoi();
          productCard.requestForm.destroy();
          productCard.unselect();
        }
      });

      // Select the Select tab automatically
      this.tabContainer.selectTab(this.selectPaneTab.title);

      // Lock Options tab
      this.tabContainer.tabItems.find(function (tab) {
        return tab.title === 'Options';
      }).style.pointerEvents = 'none';

      // Unlock Select tab
      this.tabContainer.tabItems.find(function (tab) {
        return tab.title === 'Select';
      }).style.pointerEvents = '';
    },

    modifyRequestSubmit: function(evt) {
      // Select the Options tab automatically
      this.tabContainer.selectTab('Options');

      // unlock Select tab
      this.tabContainer.tabItems.find(function (tab) {
        return tab.title === 'Select';
      }).style.pointerEvents = '';

      // unlock Options tab
      this.tabContainer.tabItems.find(function (tab) {
        return tab.title === 'Options';
      }).style.pointerEvents = '';

      // Lock Submit tab
      this.tabContainer.tabItems.find(function (tab) {
        return tab.title === 'Submit';
      }).style.pointerEvents = 'none';
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
