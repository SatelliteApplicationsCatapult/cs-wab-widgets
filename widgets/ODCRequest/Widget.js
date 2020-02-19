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
    "jimu/dijit/TabContainer3"
    ],
function(declare, BaseWidget, lang, parser, on, BorderContainer, TabContainer, ContentPane,
         GraphicsLayer, DateTextBox, Textarea, Button, _WidgetsInTemplateMixin, ProductCard,
         TabContainer3) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget, _WidgetsInTemplateMixin], {

    // Custom widget code goes here

    baseClass: 'odc-request',
    // this property is set by the framework when widget is loaded.
    // name: 'ODCRequest',
    // add additional properties here

    productCardList: [],

    productList: [
      {
        "description": "NDVI anomaly, showing changes in NDVI between two time periods.",
        "display_name": "NDVI Anomaly",
        "name": "processes.ndvi_anomaly.NDVIAnomaly",
        "args": [
          {
            "description": "Area of interest",
            "display_name": "AOI",
            "name": "aoi",
            "type": "wkt",
            "valid_values": []
          },
          {
            "description": "projection to generate the output in.",
            "display_name": "projection",
            "name": "projection",
            "type": "str",
            "valid_values": []
          },
          {
            "description": "Start date of the period to use for the baseline",
            "display_name": "Baseline Start Date",
            "name": "baseline_start_date",
            "type": "date",
            "valid_values": []
          },
          {
            "description": "End date of the period to use for the baseline",
            "display_name": "Baseline End Date",
            "name": "baseline_end_date",
            "type": "date",
            "valid_values": []
          },
          {
            "description": "Start date of the period to use for the analysis",
            "display_name": "Analysis Start Date",
            "name": "analysis_start_date",
            "type": "date",
            "valid_values": []
          },
          {
            "description": "End date of the period to use for the analysis",
            "display_name": "Analysis End Date",
            "name": "analysis_end_date",
            "type": "date",
            "valid_values": []
          },
          {
            "description": "Satellite to use for the baseline",
            "display_name": "Baseline Satellite",
            "name": "platform_base",
            "type": "str",
            "valid_values": [
              "SENTINEL_2",
              "LANDSAT_4",
              "LANDSAT_5",
              "LANDSAT_7",
              "LANDSAT_8"
            ]
          },
          {
            "description": "Satellite to use for the analysis",
            "display_name": "Analysis Satellite",
            "name": "platform_analysis",
            "type": "str",
            "valid_values": [
              "SENTINEL_2",
              "LANDSAT_4",
              "LANDSAT_5",
              "LANDSAT_7",
              "LANDSAT_8"
            ]
          },
          {
            "description": "Pixel resolution in meters",
            "display_name": "resolution in meters",
            "name": "res",
            "type": "int",
            "valid_values": [
              0,
              500
            ]
          }
        ]
      },
      {
        "description": "NDVI anomaly, showing changes in NDVI between two time periods.",
        "display_name": "NDVI Anomaly 2",
        "name": "processes.ndvi_anomaly.NDVIAnomaly2",
        "args": [
          {
            "description": "Area of interest",
            "display_name": "AOI",
            "name": "aoi",
            "type": "wkt",
            "valid_values": []
          },
          {
            "description": "projection to generate the output in.",
            "display_name": "projection",
            "name": "projection",
            "type": "str",
            "valid_values": []
          },
          {
            "description": "Start date of the period to use for the baseline",
            "display_name": "Baseline Start Date",
            "name": "baseline_start_date",
            "type": "date",
            "valid_values": []
          },
          {
            "description": "End date of the period to use for the baseline",
            "display_name": "Baseline End Date",
            "name": "baseline_end_date",
            "type": "date",
            "valid_values": []
          },
          {
            "description": "Start date of the period to use for the analysis",
            "display_name": "Analysis Start Date",
            "name": "analysis_start_date",
            "type": "date",
            "valid_values": []
          },
          {
            "description": "End date of the period to use for the analysis",
            "display_name": "Analysis End Date",
            "name": "analysis_end_date",
            "type": "date",
            "valid_values": []
          },
          {
            "description": "Satellite to use for the baseline",
            "display_name": "Baseline Satellite",
            "name": "platform_base",
            "type": "str",
            "valid_values": [
              "SENTINEL_2",
              "LANDSAT_4",
              "LANDSAT_5",
              "LANDSAT_7",
              "LANDSAT_8"
            ]
          },
          {
            "description": "Satellite to use for the analysis",
            "display_name": "Analysis Satellite",
            "name": "platform_analysis",
            "type": "str",
            "valid_values": [
              "SENTINEL_2",
              "LANDSAT_4",
              "LANDSAT_5",
              "LANDSAT_7",
              "LANDSAT_8"
            ]
          },
          {
            "description": "Pixel resolution in meters",
            "display_name": "resolution in meters",
            "name": "res",
            "type": "int",
            "valid_values": []
          }
        ]
      }
    ],

    //methods to communication with app container:
    postCreate: function() {
      this.inherited(arguments);
      console.log('ODCRequest::postCreate');
    },

    startup: function() {
      this.inherited(arguments);
      console.log('ODCRequest::startup');

      this.createSelectProductPane();

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

    },

    onOpen: function(){
      console.log('ODCRequest::onOpen');
    },

    createSelectProductPane: function () {

      // TODO: Here it will call the backend API to fetch the productList JSON

      for (const product of this.productList){

        var productCard = new ProductCard({
          name: product.name,
          display_name: product.display_name,
          description: product.description,
          args: product.args,
          formPane: this.formPane,
          map: this.map
        });

        productCard.placeAt(this.selectPane);
        productCard.on('on-product-selected', lang.hitch(this, this._productSelectedOnChanged));

        this.productCardList.push(productCard);
      }
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
