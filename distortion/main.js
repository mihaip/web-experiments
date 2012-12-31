var currentGrid;
var datasourcesById = {};

function addDatasource(id, datasource, label) {
  datasourcesById[id] = datasource;
  
  var datasourceOption = document.createElement('option');
  datasourceOption.datasource = datasource;
  datasourceOption.textContent = label;
  datasourceOption.selected = location.search == '?' + id;
  
  $('datasources').appendChild(datasourceOption);
}

function regenerate() {
  if (currentGrid) {
    currentGrid.dispose();
  }
  var datasource =
      $('datasources').options[$('datasources').selectedIndex].datasource;
  var gridSize = 
      parseInt($('grid-size').options[$('grid-size').selectedIndex].value, 10);

  currentGrid = new Grid($('container'), gridSize, datasource);
}

function toggleGrid() {
  toggleClass($('container'), 'grid-invisible');
}

function togglePoints() {
  toggleClass($('container'), 'points-invisible');
}

function main() {
  if (!('WebKitCSSMatrix' in window)) {
    alert('WebKitCSSMatrix is not available, ' +
        'this demo cannot operate without it.');
  }
  
  if (!Modernizr.csstransforms3d) {
    alert('CSS 3D Transforms are not supported by your browser, ' +
        'results may not be accurate');
  }

  if ('ontouchmove' in document) {
    document.body.className += ' touches';
  }

  addDatasource(
      'mandrill',
      new ImageDatasource('resources/mandrill.jpeg', 500, 500),
      'Mandrill');
  addDatasource(
      'checkboard800',
      new CheckerboardDatasource(800, 600),
      'Checkerboard (800 x 600)');
  addDatasource(
      'checkerboard600',
      new CheckerboardDatasource(600, 600),
      'Checkerboard (600 x 600)');
  addDatasource(
      'loremipsum',
      new IframeDatasource('resources/loremipsum.html', 400, 400),
      'Lorem ipsum page');
  addDatasource(
      'google',
      new IframeDatasource('http://www.google.com/', 800, 600),
      'google.com');
  addDatasource(
      'tron',
      new VideoDatasource('resources/tron.mp4', 850, 350),
      'Tron Legacy');
      
  $('datasources').addEventListener('change', regenerate, false);
  $('grid-size').addEventListener('change', regenerate, false);
  $('show-grid').addEventListener('change', toggleGrid, false);
  $('show-points').addEventListener('change', togglePoints, false);
  
  regenerate();
}

addEventListener('DOMContentLoaded', main, false);
