///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define(["dojo/_base/array"],
  function(array) {

    return {

      setNodeText: function(nd, text) {
        nd.innerHTML = "";
        if (text) {
          nd.appendChild(document.createTextNode(text));
        }
      },

      setNodeTitle: function(nd, text) {
        nd.title = "";
        if (text) {
          nd.setAttribute("title", text);

          let link = document.createElement('a')
          link.href = 'https://arcgis01.satapps.org/portal/apps/sites/?fromEdit=true#/data/pages/data-cube'
          link.style= 'vertical-align: middle;'
          link.target = '_blank'

          let img = document.createElement('img');
          img.src = "widgets/ODCRequest/images/information.png"
          img.style = "width: 35px; height: 12px; object-fit: contain; opacity:0.6;"
          link.appendChild(img)
          nd.appendChild(link);
        }
      },

      setNodeHTML: function(nd, html) {
        nd.innerHTML = "";
        if (html) {
          nd.innerHTML = html;
        }
      }
    };
  });
