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
    "esri/toolbars/draw",
    "esri/symbols/SimpleFillSymbol",
    "esri/graphic",
    "esri/geometry/webMercatorUtils",
    "dijit/form/DateTextBox",
    "dijit/form/Textarea",
    "dijit/form/Button",
    "dijit/_WidgetsInTemplateMixin",
    "./js/ProductCard"
    ],
function(declare, BaseWidget, lang, parser, on, BorderContainer, TabContainer, ContentPane,
         GraphicsLayer, Draw, SimpleFillSymbol, Graphic, webMercatorUtils, DateTextBox,
         Textarea, Button, _WidgetsInTemplateMixin, ProductCard) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget, _WidgetsInTemplateMixin], {

    // Custom widget code goes here

    baseClass: 'odc-request',
    // this property is set by the framework when widget is loaded.
    // name: 'ODCRequest',
    // add additional properties here
    _aoiGraphic: null,
    _drawAoi: null,

    productCardList: [],

    productList: [
      {
        "description": "NDVI anomaly, showing changes in NDVI between two time periods.",
        "display_name": "NDVI Anomaly",
        "name": "processes.ndvi_anomaly.NDVIAnomaly",
        "args": [
          {
            "description": "Area of interest",
            "name": "aoi",
            "type": "wkt"
          },
          {
            "description": "projection to generate the output in.",
            "name": "projection",
            "type": "str"
          },
          {
            "description": "Start date of the period to use for the baseline",
            "name": "baseline_start_date",
            "type": "date"
          },
          {
            "description": "End date of the period to use for the baseline",
            "name": "baseline_end_date",
            "type": "date"
          },
          {
            "description": "Start date of the period to use for the analysis",
            "name": "analysis_start_date",
            "type": "date"
          },
          {
            "description": "End date of the period to use for the analysis",
            "name": "analysis_end_date",
            "type": "date"
          },
          {
            "description": "Satellite to use for the baseline",
            "name": "platform_base",
            "type": "str"
          },
          {
            "description": "Satellite to use for the analysis",
            "name": "platform_analysis",
            "type": "str"
          },
          {
            "description": "Pixel resution in meters",
            "name": "res",
            "type": "int"
          }
        ]
      },
      {
        "description": "NDVI anomaly, showing changes in NDVI between two time periods.",
        "display_name": "NDVI Anomaly2",
        "name": "processes.ndvi_anomaly.NDVIAnomaly2",
        "args": [
          {
            "description": "Area of interest",
            "name": "aoi",
            "type": "wkt"
          },
          {
            "description": "projection to generate the output in.",
            "name": "projection",
            "type": "str"
          },
          {
            "description": "Start date of the period to use for the baseline",
            "name": "baseline_start_date",
            "type": "date"
          },
          {
            "description": "End date of the period to use for the baseline",
            "name": "baseline_end_date",
            "type": "date"
          },
          {
            "description": "Start date of the period to use for the analysis",
            "name": "analysis_start_date",
            "type": "date"
          },
          {
            "description": "End date of the period to use for the analysis",
            "name": "analysis_end_date",
            "type": "date"
          },
          {
            "description": "Satellite to use for the baseline",
            "name": "platform_base",
            "type": "str"
          },
          {
            "description": "Satellite to use for the analysis",
            "name": "platform_analysis",
            "type": "str"
          },
          {
            "description": "Pixel resution in meters",
            "name": "res",
            "type": "int"
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
    },

    onOpen: function(){
      console.log('ODCRequest::onOpen');
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
      console.log('geometry', evt.geometry);
      var coord = webMercatorUtils.webMercatorToGeographic(evt.geometry);
      console.log('coord', coord);
      console.log(this._esriGeometryToWkt(coord));

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
    },

    createSelectProductPane: function () {

      // TODO: Here it will call the backend API to fetch the productList JSON

      for (const product of this.productList){

        var productCard = new ProductCard({
          name: product.name,
          display_name: product.display_name,
          description: product.description,
          args: product.args,
          formPane: this.formPane
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
          productCard.requestForm.destroy();
          productCard.unselect();
        }
      });

      // Select the form tab panel automatically
      this.tabContainer.selectChild(this.formPane);

      // Unlock form tab to be selected
      this.formPane.set('disabled', false);
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
