define([
    'dojo/_base/declare',
    'jimu/BaseWidget',
    'dojo/_base/lang',
    "esri/layers/GraphicsLayer",
    "esri/toolbars/draw",
    "esri/symbols/SimpleFillSymbol",
    "esri/graphic",
    "esri/geometry/webMercatorUtils"],
function(declare, BaseWidget, lang, GraphicsLayer, Draw, SimpleFillSymbol, Graphic, webMercatorUtils) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {

    // Custom widget code goes here

    baseClass: 'odc-request',
    // this property is set by the framework when widget is loaded.
    // name: 'ODCRequest',
    // add additional properties here
    _aoiGraphic: null,
    _drawAoi: null,

    //methods to communication with app container:
    postCreate: function() {
      this.inherited(arguments);
      console.log('ODCRequest::postCreate');
    },

    startup: function() {
      this.inherited(arguments);
      console.log('ODCRequest::startup');
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
