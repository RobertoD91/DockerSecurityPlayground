var Model__currentElementID = 0;
var Model__networkID = 0;
const Model__CONTAINER_BASENAME = "element_";
const Model__NETWORK_BASENAME = "network_";
// Angular scope variable
var Model__AppScope = null;
const NETWORK_ELEMENT_TYPE = "NetworkElement";
const NETWORK_TYPE = 'Network';
const Graph__NetworkElementLabel = {
  type : NETWORK_ELEMENT_TYPE,
  contentHTML : '<h5 id="toptitle" style="margin:0px;">'+NETWORK_ELEMENT_TYPE+'</h5><br>'+
  '<img src="assets/docker_image_icons/host.png" width="48" height="48">'
};
var elementToEdit = '';
var theGraph;

var Popup = function Popup(cell, Model__AppScope) {
  var popupContainer ;
  function show() {
    if (cell.type == NETWORK_TYPE) {
      var content = document.createElement('div');
      var networkName = cell.id;
      if(cell.edges && cell.edges.length != 0) {
      alert("Cannot change a network with attached elements");
      } else {
        Model__AppScope.onClickEditNetwork(networkName);
      }
    }  else if (cell.type == 'NetworkElement') { // SHOW EditNetworkElement
      var content = document.createElement('div');
      var containerName = cell.id;
      // Initialized for the end
      elementToEdit = containerName;
      Model__AppScope.onClickEditContainer(containerName);
    }
  }
  return {
    show: show
  };
}


// Is already connected the cell?
function isAlreadyConnected(networkCell, elementCell) {
  for (var i = 0; i < networkCell.getEdgeCount(); i++)  {
   var source = ( networkCell.edges[i]).source;
   var target = ( networkCell.edges[i]).target;
    console.log(source);
    console.log(target);
    console.log(elementCell);
   if (source.name == elementCell.name || target.name == elementCell.name)
       return true;
   else
       return false;
  }
  return false;
}

function graphRenameProperty(cells, oldName, newName) {
  // Do nothing if the names are the same
  if (oldName == newName) {
    return cells;
  }
  // Check for the old property name to avoid a ReferenceError in strict mode.
  if (cells.hasOwnProperty(oldName)) {
    cells[newName] = cells[oldName];
    delete cells[oldName];
  }
  return cells;
};


function getCellsByName(name) {
  var cells = theGraph.model.cells;
  return _.filter(cells, {name: name});
}

function Graph__update(cell, newName, oldName) {
  var label = cell.value;
  console.log(label);
  var $html = $('<div />',{html:label});
  // replace "Headline" with "whatever" => Doesn't work
  $html.find('h5').html(newName);
  var newValue = $html.html();
  theGraph.model.setValue(cell, newValue)

  // Update the cell id
  cell.setId(newName);
  var cells = theGraph.model.cells
  // Rename cell in id
  graphRenameProperty(cells, oldName, newName);
  var cellWithOldName = getCellsByName(oldName);
  _.each(cellWithOldName, function(e) {
    console.log("Update "+e.name);
    e.name= newName;
  });
  // cells.remove(oldName);
  // cells.put(newName, cell);
}

function graphEditCallback(oldName, newName) {
  console.log("Oldname"+ oldName);
  var theCell = theGraph.getModel().getCell(oldName);
  // Update the cell name
  Graph__update(theCell, newName, oldName);
}

function _incrementID(id, names, stringBase) {
  _.each(names, function(c) {
    if(c.startsWith(stringBase)) {
      var n = c.replace(stringBase, "");
      if(!isNaN(n)) {
        if (id<= n)
          id++;
      }
    }
  });
  return id;
}

function canvasLoadedCallback(canvasXML, containerNetworks, networkNames) {
  var doc = mxUtils.parseXml(canvasXML);
  var codec = new mxCodec(doc);
  codec.decode(doc.documentElement, theGraph.getModel());
  Model__currentElementID = _incrementID(Model__currentElementID, containerNetworks, Model__CONTAINER_BASENAME)
  Model__networkID = _incrementID(Model__networkID, networkNames, Model__NETWORK_BASENAME)
  }



function Graph__addPort(graph, v1, value, x, y, width, height, style, offsetX, offsetY, relative = true) {
  var port = graph.insertVertex(v1, null, value , x, y, width, height, style, relative);
  port.setConnectable(true);
  // Adds the ports at various relative locations
  port.geometry.offset = new mxPoint(offsetX, offsetY);
}

function Graph__addFirstPort(graph, v1, name) {
  // Graph__addPort(graph, v1, 'Trigger', 0, 0.25, 16, 16, 'port;image=editors/images/overlays/flash.png;align=right;imageAlign=right;spacingRight=18', -6, -8);
  Graph__addPort(graph, v1, {type: 'Interface', name: name }, 0, 0.25, 16, 16, 'port;image=editors/images/ethernet.png;align=right;imageAlign=right;spacingRight=18', -6, -8);
}
function Graph__addSecondPort(graph, v1, name) {
  Graph__addPort(graph, v1, {type: 'Interface', name: name}, 0, 0.75, 16, 16, 'port;image=editors/images/ethernet.png;align=right;imageAlign=right;spacingRight=18', -6, -4);
}
function Graph__addThirdPort(graph, v1, name) {
  Graph__addPort(graph, v1, {type: 'Interface', name: name}, 1, 0.25, 16, 16, 'port;image=editors/images/ethernet.png;spacingLeft=18', -8, -8);
}
function Graph__addFourthPort(graph, v1, name) {
  Graph__addPort(graph, v1, {type: 'Interface', name: name}, 1, 0.75, 16, 16,'port;image=editors/images/ethernet.png;spacingLeft=18', -8, -4);
}


function Graph__addPorts(graph, v1, numPorts) {
  switch(numPorts) {
    case 1:
      Graph__addFirstPort(graph, v1);
      break;
    case 2:
      Graph__addFirstPort(graph, v1);
      Graph__addSecondPort(graph, v1);
      break;
    case 3:
      Graph__addFirstPort(graph, v1);
      Graph__addSecondPort(graph, v1);
      Graph__addThirdPort(graph, v1);
      break;
    case 4:
      Graph__addFirstPort(graph, v1);
      Graph__addSecondPort(graph, v1);
      Graph__addThirdPort(graph, v1);
      Graph__addFourthPort(graph, v1);
      break;
    default:
      console.log("Strange number");
      break;
  }
}

// Create a new element and update angular model
function Model__ElementCreate() {
  var nameContainer = Model__CONTAINER_BASENAME + Model__currentElementID;
  console.log("add new element");
  Model__AppScope.newContainer(nameContainer);
  Model__currentElementID++;
  return nameContainer;
}
function Model__NetworkCreate() {
    var nameNetwork = Model__NETWORK_BASENAME + Model__networkID;
    // Model__AppScope.newContainer(nameContainer);
    Model__networkID++;
    Model__AppScope.addNetworkElement(nameNetwork);
    return nameNetwork;
}


function Graph__ElementCreate(graph, nameContainer, x, y) {
  var parent = graph.getDefaultParent();
  var model = graph.getModel();
  var v1 = null;
  var label = Graph__NetworkElementLabel;

  label.name = nameContainer;
  model.beginUpdate();
  try {
    // NOTE: For non-HTML labels the image must be displayed via the style
    // rather than the label markup, so use 'image=' + image for the style.
    // as follows: v1 = graph.insertVertex(parent, null, label,
    // pt.x, pt.y, 120, 120, 'image=' + image);
    v1 = graph.insertVertex(parent, nameContainer, label, x, y, 120, 120);
    v1.setConnectable(false);

    // Presets the collapsed size
    v1.geometry.alternateBounds = new mxRectangle(0, 0, 120, 40);
    Graph__addFirstPort(graph, v1, nameContainer);
    Graph__addSecondPort(graph, v1, nameContainer);
    Graph__addThirdPort(graph, v1, nameContainer);
    Graph__addFourthPort(graph, v1, nameContainer);
  }
  finally {
    graph.setSelectionCell(v1);
    model.endUpdate();
    Graph__update(v1, nameContainer, NETWORK_ELEMENT_TYPE);
  }
}

function Graph__NetworkCreate(graph, nameNetwork, x, y) {
  var parent = graph.getDefaultParent();
    var model = graph.getModel();
    var v1 = null;
    model.beginUpdate();
    try {
      // NOTE: For non-HTML labels the image must be displayed via the style
      // rather than the label markup, so use 'image=' + image for the style.
      // as follows: v1 = graph.insertVertex(parent, null, label,
      // pt.x, pt.y, 120, 120, 'image=' + image);
      v1 = graph.insertVertex(parent, nameNetwork, {
        type: NETWORK_TYPE,
        contentHTML : '<h5>'+nameNetwork+'</h5>',
        name: nameNetwork
      }, x, y, 120, 120, 'shape=cloud');


      v1.setConnectable(true);

      // Presets the collapsed size
      v1.geometry.alternateBounds = new mxRectangle(0, 0, 120, 40);
    }
    finally {
      graph.setSelectionCell(v1);
      model.endUpdate();
      // Graph__update(v1, nameContainer, NETWORK_ELEMENT_TYPE);
    }
}

/*
  Add an element, the label describes the drawn element
  */
function addSidebarElementIcon(graph, sidebar) {
  // Function that is executed when the image is dropped on
  // the graph. The cell argument points to the cell under
  // the mousepointer if there is one.
  var funct = function(graph, evt, cell, x, y) {
    var nameContainer = Model__ElementCreate();
    Graph__ElementCreate(graph, nameContainer, x, y);
  }

  const Graph__NetworkElementImage =  'assets/docker_image_icons/host.png';
  // Creates the image which is used as the sidebar icon (drag source)
  var img = document.createElement('img');
  img.setAttribute('src', Graph__NetworkElementImage);
  img.style.width = '48px';
  img.style.height = '48px';
  img.title = 'Drag this to the diagram to create a new vertex';
  var ele = document.createElement('span');
  ele.innerHTML = "   Host";
  var dragContainer = document.createElement('div');
  dragContainer.className = "row";
  dragContainer.style.marginLeft = "40px";
  dragContainer.appendChild(img);
  dragContainer.appendChild(ele);
  // sidebar.appendChild(dragContainer);


   sidebar.appendChild(img);
   sidebar.appendChild(ele);

  var dragElt = document.createElement('div');
  dragElt.style.border = 'dashed black 1px';
  dragElt.style.width = '120px';
  dragElt.style.height = '120px';

  // Creates the image which is used as the drag icon (preview)
  var ds = mxUtils.makeDraggable(img, graph, funct, dragElt, 0, 0, true, true);
  ds.setGuidesEnabled(true);

};

function addSidebarNetworkIcon(graph, sidebar) {
  // Function that is executed when the image is dropped on
  // the graph. The cell argument points to the cell under
  // the mousepointer if there is one.
  var funct = function(graph, evt, cell, x, y) {
    var nameNetwork = Model__NetworkCreate();
    Graph__NetworkCreate(graph, nameNetwork, x, y);
  }

  const Graph__NetworkImage =  'assets/docker_image_icons/network_icon.png';
  // Creates the image which is used as the sidebar icon (drag source)
  var img = document.createElement('img');
  img.setAttribute('src', Graph__NetworkImage);
  img.style.width = '48px';
  img.style.height = '48px';
  img.title = 'Drag this to the diagram to create a new vertex';
  var ele = document.createElement('span');
  ele.innerHTML = " Network";
  var dragContainer = document.createElement('div');
  dragContainer.className = "row";
  dragContainer.style.marginLeft = "40px";
  dragContainer.appendChild(img);
  dragContainer.appendChild(ele);
  // sidebar.appendChild(dragContainer);

   sidebar.appendChild(img);
   sidebar.appendChild(ele);

  var dragElt = document.createElement('div');
  dragElt.style.border = 'dashed black 1px';
  dragElt.style.width = '120px';
  dragElt.style.height = '120px';

  // Creates the image which is used as the drag icon (preview)
  var ds = mxUtils.makeDraggable(img, graph, funct, dragElt, 0, 0, true, true);
  ds.setGuidesEnabled(true);
}

function configureStylesheet(graph) {
  var style = new Object();
  style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
  style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
  style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
  style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
  style[mxConstants.STYLE_GRADIENTCOLOR] = '#FFFFFF';
  style[mxConstants.STYLE_FILLCOLOR] = '#FFFFFF';
  style[mxConstants.STYLE_STROKECOLOR] = '#1B78C8';
  style[mxConstants.STYLE_FONTCOLOR] = '#000000';
  style[mxConstants.STYLE_ROUNDED] = true;
  style[mxConstants.STYLE_OPACITY] = '80';
  style[mxConstants.STYLE_FONTSIZE] = '10';
  style[mxConstants.STYLE_FONTSTYLE] = 0;
  style[mxConstants.STYLE_IMAGE_WIDTH] = '48';
  style[mxConstants.STYLE_IMAGE_HEIGHT] = '48';
  graph.getStylesheet().putDefaultVertexStyle(style);

  // NOTE: Alternative vertex style for non-HTML labels should be as
  // follows. This repaces the above style for HTML labels.
  /*var style = new Object();
  style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
  style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
  style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
  style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
  style[mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_CENTER;
  style[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
  style[mxConstants.STYLE_SPACING_TOP] = '56';
  style[mxConstants.STYLE_GRADIENTCOLOR] = '#7d85df';
  style[mxConstants.STYLE_STROKECOLOR] = '#5d65df';
  style[mxConstants.STYLE_FILLCOLOR] = '#adc5ff';
  style[mxConstants.STYLE_FONTCOLOR] = '#1d258f';
  style[mxConstants.STYLE_FONTFAMILY] = 'Verdana';
  style[mxConstants.STYLE_FONTSIZE] = '12';
  style[mxConstants.STYLE_FONTSTYLE] = '1';
  style[mxConstants.STYLE_ROUNDED] = '1';
  style[mxConstants.STYLE_IMAGE_WIDTH] = '48';
  style[mxConstants.STYLE_IMAGE_HEIGHT] = '48';
  style[mxConstants.STYLE_OPACITY] = '80';
  graph.getStylesheet().putDefaultVertexStyle(style);*/

  style = new Object();
  style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
  style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
  style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
  style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
  style[mxConstants.STYLE_FILLCOLOR] = '#FF9103';
  style[mxConstants.STYLE_GRADIENTCOLOR] = '#F8C48B';
  style[mxConstants.STYLE_STROKECOLOR] = '#E86A00';
  style[mxConstants.STYLE_FONTCOLOR] = '#000000';
  style[mxConstants.STYLE_ROUNDED] = true;
  style[mxConstants.STYLE_OPACITY] = '80';
  style[mxConstants.STYLE_STARTSIZE] = '30';
  style[mxConstants.STYLE_FONTSIZE] = '16';
  style[mxConstants.STYLE_FONTSTYLE] = 1;
  graph.getStylesheet().putCellStyle('group', style);

  style = new Object();
  style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
  style[mxConstants.STYLE_FONTCOLOR] = '#774400';
  style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
  style[mxConstants.STYLE_PERIMETER_SPACING] = '6';
  style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
  style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
  style[mxConstants.STYLE_FONTSIZE] = '10';
  style[mxConstants.STYLE_FONTSTYLE] = 2;
  style[mxConstants.STYLE_IMAGE_WIDTH] = '16';
  style[mxConstants.STYLE_IMAGE_HEIGHT] = '16';
  graph.getStylesheet().putCellStyle('port', style);

  style = graph.getStylesheet().getDefaultEdgeStyle();
  style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#FFFFFF';
  style[mxConstants.STYLE_STROKEWIDTH] = '2';
  style[mxConstants.STYLE_ROUNDED] = true;
  style[mxConstants.STYLE_EDGE] = mxEdgeStyle.EntityRelation;
};

function addToolbarButton(editor, toolbar, action, label, image, isTransparent) {
  var button = document.createElement('button');
  button.style.fontSize = '10';
  if (image != null)
  {
    var img = document.createElement('img');
    img.setAttribute('src', image);
    img.style.width = '16px';
    img.style.height = '16px';
    img.style.verticalAlign = 'middle';
    img.style.marginRight = '2px';
    button.appendChild(img);
  }
  if (isTransparent)
  {
    button.style.background = 'transparent';
    button.style.color = '#FFFFFF';
    button.style.border = 'none';
  }
    mxEvent.addListener(button, 'click', function(evt) {
        editor.execute(action);
  });
  mxUtils.write(button, label);
  toolbar.appendChild(button);
};

function showModalWindow(graph, title, content, width, height) {
  var background = document.createElement('div');
  background.style.position = 'absolute';
  background.style.left = '0px';
  background.style.top = '0px';
  background.style.right = '0px';
  background.style.bottom = '0px';
  background.style.background = 'black';
  mxUtils.setOpacity(background, 50);
  document.body.appendChild(background);

  if (mxClient.IS_IE)
  {
    new mxDivResizer(background);
  }

  var x = Math.max(0, document.body.scrollWidth/2-width/2);
  var y = Math.max(10, (document.body.scrollHeight ||
    document.documentElement.scrollHeight)/2-height*2/3);
  var wnd = new mxWindow(title, content, x, y, width, height, false, true);
  wnd.setClosable(true);

  // Fades the background out after after the window has been closed
  wnd.addListener(mxEvent.DESTROY, function(evt)
    {
      graph.setEnabled(true);
      mxEffects.fadeOut(background, 50, true,
        10, 30, true);
    });

  graph.setEnabled(false);
  graph.tooltipHandler.hide();
  wnd.setVisible(true);
};

function showModalProperties(graph, content) {
  showModalWindow(graph, 'Properties', content, 400, 300);
}

// Assigns some global constants for general behaviour, eg. minimum
// size (in pixels) of the active region for triggering creation of
// new connections, the portion (100%) of the cell area to be used
// for triggering new connections, as well as some fading options for
// windows and the rubberband selection.
function mxInitConstants() {
  mxConstants.MIN_HOTSPOT_SIZE = 16;
  mxConstants.DEFAULT_HOTSPOT = 1;
}

function mxInitGuides() {
  // Enables guides
  mxGraphHandler.prototype.guidesEnabled = true;
  // Alt disables guides
  mxGuide.prototype.isEnabledForEvent = function(evt) {
    return !mxEvent.isAltDown(evt);
  };
}

function mxWorkaroundIE() {
  // Workaround for Internet Explorer ignoring certain CSS directives
  if (mxClient.IS_QUIRKS)
  {
    document.body.style.overflow = 'hidden';
    new mxDivResizer(container);
    new mxDivResizer(outline);
    new mxDivResizer(toolbar);
    new mxDivResizer(sidebar);
    new mxDivResizer(status);
  }
}


function mxInitGraph(graph, appScope) {
  Model__AppScope = appScope;
  // Disable highlight of cells when dragging from toolbar
  theGraph = graph;
  graph.setDropEnabled(false);
  Model__AppScope.initGraphCallbacks([graphEditCallback, canvasLoadedCallback]);

  // Override the insertVertex in order to use toDraw property
  var mxGraphInsertVertex = mxGraph.prototype.insertVertex;
  mxGraph.prototype.insertVertex = function(parent, id, value, x, y, width, height, style, relative) {
    var v1 =  mxGraphInsertVertex.apply(this, [parent, id, value.contentHTML, x, y, width, height, style, relative]);
    // Add type in cell
    v1.type = value.type;
    v1.name = value.name;
    return v1;
  }

  mxCloneCells = mxGraph.prototype.cloneCells;
  mxGraph.prototype.cloneCells = function(cells, allowInvalidEdges, mapping, keepPosition) {
    return mxCloneCells.apply(this, arguments);
  }




  // Override the valid target: must not be an Interface
  /*
  var isValidTarget = mxConnectionHandler.prototype.isValidTarget;
  mxConnectionHandler.prototype.isValidTarget = function(cell) {
    isInterface = cell.type  == 'Interface';
    console.log("in valid target");
    return !isInterface &&  isValidTarget.apply(this, arguments);
  }
  */
  mxGetEdgeValidationError = mxGraph.prototype.getEdgeValidationError;
  mxGraph.prototype.getEdgeValidationError = function(edge, source, target) {
    if(target.type == 'Interface') {
      return "Cannot attach to interface";
    }
    if(isAlreadyConnected(target, source)) {
      return "Network Element Already connected";
    }
    return mxGetEdgeValidationError.apply(this, arguments);
  }

  mxCellRemove= mxGraphModel.prototype.remove;
  var MX__CanRemove = true;
  mxGraphModel.prototype.remove = function(cell) {
    if (cell.edge) {
      var containerName = cell.source.name;
      var networkName = cell.target.name;
      Model__AppScope.detachNetwork(networkName, containerName);

    } else if(cell.type == NETWORK_ELEMENT_TYPE) {
      console.log("Delete container from model");
      Model__AppScope.deleteContainer(cell.name);
    } else if(cell.type == NETWORK_TYPE) {
      console.log("Delete network from model (only if no attached element)");
      if(!Model__AppScope.isNetworkAttached(cell.name)) {
          Model__AppScope.deleteNetwork(cell.name);
      } else {
        alert("Cannot delete a network with attached elements");
        MX__CanRemove = false;
        // Set can remoe after 2 seconds in order to enable remove mode after that all ports have been processed
        setTimeout(function() {
          MX__CanRemove = true;
        }, 2000);
      }
    }
    if (MX__CanRemove) {
      console.log("CAN REMOVE");
      return mxCellRemove.apply(this, arguments);
    } else {
      console.log("CANNOTREMOVE");
      return false;
    }
  }
  mxPaste = mxClipboard.paste;
  mxClipboard.paste = function(graph) {
    if (!mxClipboard.isEmpty()) {
      var cells = graph.getImportableCells(mxClipboard.getCells());
      _.each(cells, function(c) {
        switch (c.type) {
          case NETWORK_ELEMENT_TYPE:
            var nc = Model__ElementCreate();
            const newX  = c.geometry.x + 10;
            const newY  = c.geometry.y + 10;
            Graph__ElementCreate(graph, nc, newX, newY);
            break;
          case NETWORK_TYPE:
            var ne = Model__NetworkCreate();
            const newX2 = c.geometry.x + 10;
            const newY2 = c.geometry.y + 10;
            Graph__NetworkCreate(graph, ne, newX2, newY2);
        }
      });

  }
  // return mxPaste.apply(this, arguments);
}



  // Called when the connection is created
  var mxCreateEdge = mxConnectionHandler.prototype.createEdge;
  mxConnectionHandler.prototype.createEdge = function(value, source, target, style) {
    Model__AppScope.attachNetwork(target.name, source.name);
    return mxCreateEdge.apply(this, arguments);
  }
  // Override remove edge
  mxRemoveEdge = mxCell.prototype.removeEdge
  mxCell.prototype.removeEdge = function(edge, isOutgoing) {
    function firstDelete() {
      return (edge.source != null && edge.target != null);
    }
    // Remove connection only when is the first call
    if (firstDelete()) {
      Model__AppScope.detachNetwork(edge.target.name, edge.source.name);
    }
    return mxRemoveEdge.apply(this, arguments);
  }




  // Uses the port icon while connections are previewed
  graph.connectionHandler.getConnectImage = function(state)
  {
    return new mxImage(state.style[mxConstants.STYLE_IMAGE], 16, 16);
  };

  // Centers the port icon on the target port
  graph.connectionHandler.targetConnectImage = true;

  // Does not allow dangling edges
  graph.setAllowDanglingEdges(false);
  // Disables drag-and-drop into non-swimlanes.
  graph.isValidDropTarget = function(cell, cells, evt)
  {
    return this.isSwimlane(cell);
  };

  // Disables drilling into non-swimlanes.
  graph.isValidRoot = function(cell)
  {
    return this.isValidDropTarget(cell);
  }

  // Does not allow selection of locked cells
  graph.isCellSelectable = function(cell)
  {
    return !this.isCellLocked(cell);
  };


  // Returns a shorter label if the cell is collapsed and no
  // label for expanded groups
  graph.getLabel = function(cell)
  {
    var tmp = mxGraph.prototype.getLabel.apply(this, arguments); // "supercall"

    if (this.isCellLocked(cell))
    {
      // Returns an empty label but makes sure an HTML
      // element is created for the label (for event
      // processing wrt the parent label)
      return '';
    }
    else if (this.isCellCollapsed(cell))
    {
      var index = tmp.indexOf('</h1>');

      if (index > 0)
      {
        tmp = tmp.substring(0, index+5);
      }
    }

    return tmp;
  }
  // Disables HTML labels for swimlanes to avoid conflict
  // for the event processing on the child cells. HTML
  // labels consume events before underlying cells get the
  // chance to process those events.
  //
  // NOTE: Use of HTML labels is only recommended if the specific
  // features of such labels are required, such as special label
  // styles or interactive form fields. Otherwise non-HTML labels
  // should be used by not overidding the following function.
  // See also: configureStylesheet.
  graph.isHtmlLabel = function(cell) {
    return !this.isSwimlane(cell);
  }

  // To disable the folding icon, use the following code:
  /*graph.isCellFoldable = function(cell)
  {
    return false;
  }
  */

    /* Called from angular when the edit is closed
     *
     */

    /* Event for right click
     *
     */
    graph.popupMenuHandler.factoryMethod = function(menu, cell, evt) {
      // Do not fire an event here as mxEditor will
      // consume the event and start the in-place editor.
      if (graph.isEnabled() &&
        !mxEvent.isConsumed(evt) &&
        cell != null &&
        graph.isCellEditable(cell))
      {
        if (graph.model.isEdge(cell) ||
          !graph.isHtmlLabel(cell)) {
          graph.startEditingAtCell(cell);
        }
        else
        {
          Popup(cell, Model__AppScope).show();
        }
      }

      // Disables any default behaviour for the double click
      mxEvent.consume(evt);
    };

  // graph.dblClick = function(evt, cell) {
  //   // Do not fire a DOUBLE_CLICK event here as mxEditor will
  //   // consume the event and start the in-place editor.
  //   if (this.isEnabled() &&
  //     !mxEvent.isConsumed(evt) &&
  //     cell != null &&
  //     this.isCellEditable(cell))
  //   {
  //     if (this.model.isEdge(cell) ||
  //       !this.isHtmlLabel(cell))
  //     {
  //       this.startEditingAtCell(cell);
  //     }
  //     else
  //     {
  //       var content = document.createElement('div');
  //       var d = document.createElement('div');
  //       d.setAttribute('ng-include', "'views/add_element.html'");
  //       content.innerHTML = d.outerHTML;
  //       showModalWindow(this, 'Properties', content, 400, 300);
  //     }
  //   }

  //   // Disables any default behaviour for the double click
  //   mxEvent.consume(evt);
  // };

  // Enables new connections
  graph.setConnectable(true);
  // Adds all required styles to the graph (see below)
  configureStylesheet(graph);
}

function mxInitEditor(editor, container) {
  // Sets the graph container and configures the editor
  editor.setGraphContainer(container);
  var config = mxUtils.load(
    'editors/config/keyhandler-commons.xml').
    getDocumentElement();
  editor.configure(config);
  // Defines the default group to be used for grouping. The
  // default group is a field in the mxEditor instance that
  // is supposed to be a cell which is cloned for new cells.
  // The groupBorderSize is used to define the spacing between
  // the children of a group and the group bounds.
  var group = new mxCell('Group', new mxGeometry(), 'group');
  group.setVertex(true);
  group.setConnectable(false);
  editor.defaultGroup = group;
  editor.groupBorderSize = 20;
}

function createHints() {

}
function MX__ExitLab() {
  window.location.href='/lab/use/'+Model__AppScope.repoName+'/'+Model__AppScope.labName
}


function MX__SaveLab(xml) {
  Model__AppScope.saveLab(xml);
}

function mxAddNetworkElement(graph, sidebar) {
  addSidebarElementIcon(graph, sidebar);
}
function mxAddNetwork(graph, sidebar) {
  addSidebarNetworkIcon(graph, sidebar,);
}

function MX__Main(container, outline, toolbar, sidebar, status, appScope) {
  console.log("IN MXMAIN");
  // Checks if the browser is supported
  if (!mxClient.isBrowserSupported()) {
    // Displays an error message if the browser is not supported.
    mxUtils.error('Browser is not supported!', 200, false);
  }
  else {
    mxInitConstants();
    mxInitGuides();
    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.snapToTerminals = true;
    mxWorkaroundIE();

    // Creates a wrapper editor with a graph inside the given container.
    // The editor is used to create certain functionality for the
    // graph, such as the rubberband selection, but most parts
    // of the UI are custom in this example.
    var editor = new mxEditor();
    var graph = editor.graph;
    var model = graph.getModel();

    mxInitGraph(graph, appScope);
    mxInitEditor(editor, container);
    mxAddNetworkElement(graph, sidebar);
    mxAddNetwork(graph, sidebar);
    //addRouteElement(graph, sidebar);



    // Adds sidebar icons.
    //
    // NOTE: For non-HTML labels a simple string as the third argument
    // and the alternative style as shown in configureStylesheet should
    // be used. For example, the first call to addSidebar icon would
    // be as follows:
    // addSidebarIcon(graph, sidebar, 'Website', 'assets/mximages/icons48/earth.png');
    /*
    addSidebarIcon(graph, sidebar,
      '<h1 style="margin:0px;">Website</h1><br>'+
      '<img src="assets/mximages/icons48/earth.png" width="48" height="48">'+
      '<br>'+
      '<a href="http://www.jgraph.com" target="_blank">Browse</a>',
      'assets/mximages/icons48/earth.png');
    addSidebarIcon(graph, sidebar,
      '<h1 style="margin:0px;">Process</h1><br>'+
      '<img src="assets/mximages/icons48/gear.png" width="48" height="48">'+
      '<br><select><option>Value1</option><option>Value2</option></select><br>',
      'images/icons48/gear.png');
    addSidebarIcon(graph, sidebar,
      '<h1 style="margin:0px;">Keys</h1><br>'+
      '<img src="assets/mximages/icons48/keys.png" width="48" height="48">'+
      '<br>'+
      '<button onclick="mxUtils.alert(\'generate\');">Generate</button>',
      'assets/mximages/icons48/keys.png');
    addSidebarIcon(graph, sidebar,
      '<h1 style="margin:0px;">New Mail</h1><br>'+
      '<img src="assets/mximages/icons48/mail_new.png" width="48" height="48">'+
      '<br><input type="checkbox"/>CC Archive',
      'assets/mximages/icons48/mail_new.png');
    addSidebarIcon(graph, sidebar,
      '<h1 style="margin:0px;">Server</h1><br>'+
      '<img src="assets/mximages/icons48/server.png" width="48" height="48">'+
      '<br>'+
      '<input type="text" size="12" value="127.0.0.1"/>',
      'assets/mximages/icons48/server.png');
    */
    // Displays useful hints in a small semi-transparent box.
//          var hints = document.createElement('div');
//          hints.style.position = 'absolute';
//          hints.style.overflow = 'hidden';
//          hints.style.width = '230px';
//          hints.style.bottom = '56px';
//          hints.style.height = '76px';
//          hints.style.right = '20px';
//
//          hints.style.background = 'black';
//          hints.style.color = 'white';
//          hints.style.fontFamily = 'Arial';
//          hints.style.fontSize = '10px';
//          hints.style.padding = '4px';
//
//          mxUtils.setOpacity(hints, 50);
//
//          mxUtils.writeln(hints, '- Drag an image from the sidebar to the graph');
//          mxUtils.writeln(hints, '- Doubleclick on a vertex or edge to edit');
//          mxUtils.writeln(hints, '- Shift- or Rightclick and drag for panning');
//          mxUtils.writeln(hints, '- Move the mouse over a cell to see a tooltip');
//          mxUtils.writeln(hints, '- Click and drag a vertex to move and connect');
//          document.body.appendChild(hints);

    // Creates a new DIV that is used as a toolbar and adds
    // toolbar buttons.
    var spacer = document.createElement('div');
    spacer.style.display = 'inline';
    spacer.style.padding = '8px';

//          addToolbarButton(editor, toolbar, 'groupOrUngroup', '(Un)group', 'assets/mximages/group.png');
//
//          // Defines a new action for deleting or ungrouping
//          editor.addAction('groupOrUngroup', function(editor, cell)
//            {
//              cell = cell || editor.graph.getSelectionCell();
//              if (cell != null && editor.graph.isSwimlane(cell))
//              {
//                editor.execute('ungroup', cell);
//              }
//              else
//              {
//                editor.execute('group');
//              }
//            });
//
    addToolbarButton(editor, toolbar, 'delete', 'Delete', 'assets/mximages/delete2.png');
    addToolbarButton(editor, toolbar, 'cut', 'Cut', 'assets/mximages/cut.png');
    addToolbarButton(editor, toolbar, 'copy', 'Copy', 'assets/mximages/copy.png');
    addToolbarButton(editor, toolbar, 'paste', 'Paste', 'assets/mximages/paste.png');
    toolbar.appendChild(spacer.cloneNode(true));
    toolbar.appendChild(spacer.cloneNode(true));
    //addToolbarButton(editor, toolbar, 'undo', '', 'assets/mximages/undo.png');
    //addToolbarButton(editor, toolbar, 'redo', '', 'assets/mximages/redo.png');
    toolbar.appendChild(spacer.cloneNode(true));
    //addToolbarButton(editor, toolbar, 'show', 'Show', 'assets/mximages/camera.png');
    toolbar.appendChild(spacer.cloneNode(true));

    editor.addAction('save', function(editor, cell) {
      var enc = new mxCodec(mxUtils.createXmlDocument());
      var node = enc.encode(editor.graph.getModel());
      var xml = mxUtils.getPrettyXml(node);
      MX__SaveLab(xml);
    });

    // Defines a new export action
    editor.addAction('view', function(editor, cell)
      {
        var textarea = document.createElement('textarea');
        textarea.style.width = '400px';
        textarea.style.height = '400px';
//              var enc = new mxCodec(mxUtils.createXmlDocument());
//              var node = enc.encode(editor.graph.getModel());
        //textarea.value = mxUtils.getPrettyXml(node);
        textarea.value = Model__AppScope.yamlfile;
        showModalWindow(graph, 'Docker Compose', textarea, 410, 440);
      });
    editor.addAction('export', function(editor, cell) {
     Model__AppScope.exportDockerCompose();
    });

    editor.addAction('exit', function(editor, cell) {
      MX__ExitLab();
    });

    for (i = 0; i < 14; i++)
      toolbar.appendChild(spacer.cloneNode(true));
    addToolbarButton(editor, toolbar, 'view', 'View docker-compose', 'assets/mximages/info.gif');
    addToolbarButton(editor, toolbar, 'export', 'Get docker-compose', 'assets/mximages/export1.png');
    addToolbarButton(editor, toolbar, 'save', 'Save Network', 'assets/mximages/save.gif');
    toolbar.appendChild(spacer.cloneNode(true));
    toolbar.appendChild(spacer.cloneNode(true));
    addToolbarButton(editor, toolbar, 'exit', 'Exit from graph editor', 'assets/mximages/undo.png');

    // ---

    // Adds toolbar buttons into the status bar at the bottom
    // of the window.
//          addToolbarButton(editor, status, 'collapseAll', 'Collapse All', 'assets/mximages/navigate_minus.png', true);
//          addToolbarButton(editor, status, 'expandAll', 'Expand All', 'assets/mximages/navigate_plus.png', true);
//
//          status.appendChild(spacer.cloneNode(true));
//
//          addToolbarButton(editor, status, 'enterGroup', 'Enter', 'assets/mximages/view_next.png', true);
//          addToolbarButton(editor, status, 'exitGroup', 'Exit', 'assets/mximages/view_previous.png', true);
//
//          status.appendChild(spacer.cloneNode(true));

    addToolbarButton(editor, status, 'zoomIn', '', 'assets/mximages/zoom_in.png', true);
    addToolbarButton(editor, status, 'zoomOut', '', 'assets/mximages/zoom_out.png', true);
    addToolbarButton(editor, status, 'actualSize', '', 'assets/mximages/view_1_1.png', true);
//          addToolbarButton(editor, status, 'fit', '', 'assets/mximages/fit_to_size.png', true);

    // Creates the outline (navigator, overview) for moving
    // around the graph in the top, right corner of the window.
    var outln = new mxOutline(graph, outline);
    // <div ng-include=viewToInclude> </div>


    // To show the assets/mximages in the outline, uncomment the following code
    //outln.outline.labelsVisible = true;
    //outln.outline.setHtmlLabels(true);

    // Fades-out the splash screen after the UI has been loaded.
    var splash = document.getElementById('splash');
    if (splash != null)
    {
      try
      {
        mxEvent.release(splash);
        mxEffects.fadeOut(splash, 100, true);
      }
      catch (e)
      {

        // mxUtils is not available (library not loaded)
        splash.parentNode.removeChild(splash);
      }
    }
  }
  $('html').keyup(function(e){
    if(e.keyCode == 46 || e.keyCode == 8) {
      console.log("Delete action");
      editor.execute('delete');
  }
});
};