define(['dojo/_base/declare', 'jimu/BaseWidget'],
function(declare, BaseWidget) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {

    // Custom widget code goes here

    baseClass: 'odc-request',
    // this property is set by the framework when widget is loaded.
    // name: 'ODCRequest',
    // add additional properties here

    //methods to communication with app container:
    postCreate: function() {
      this.inherited(arguments);
      console.log('ODCRequest::postCreate');
    }

    // startup: function() {
    //   this.inherited(arguments);
    //   console.log('ODCRequest::startup');
    // },

    // onOpen: function(){
    //   console.log('ODCRequest::onOpen');
    // },

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
