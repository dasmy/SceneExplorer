/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-extraneous-dependencies */

import '@kitware/vtk.js/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/All';

import macro from '@kitware/vtk.js/macros';
import DataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper';
import HttpDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkHttpSceneLoader from '@kitware/vtk.js/IO/Core/HttpSceneLoader';
import vtkURLExtract from '@kitware/vtk.js/Common/Core/URLExtract';
// for picking and corresponding markers
import vtkPointPicker from '@kitware/vtk.js/Rendering/Core/PointPicker';
import vtkSphereSource from '@kitware/vtk.js/Filters/Sources/SphereSource';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';

// Force DataAccessHelper to have access to various data source
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import controlWidget from './SceneExplorerWidget';
import labelWidget from './LabelWidget';
import style from './SceneExplorer.module.css';

const iOS = /iPad|iPhone|iPod/.test(window.navigator.platform);
let autoInit = true;
let widgetCreated = false;

// Add class to body if iOS device --------------------------------------------

if (iOS) {
  document.querySelector('body').classList.add('is-ios-device');
}

function emptyContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

export function load(container, options) {
  autoInit = false;
  emptyContainer(container);

  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    background: [1, 1, 1],
    rootContainer: container,
    containerStyle: { height: '100%', width: '100%', position: 'absolute' },
  });

  const renderer = fullScreenRenderer.getRenderer();
  const renderWindow = fullScreenRenderer.getRenderWindow();
  global.renderWindow = renderWindow;

  // ----------------------------------------------------------------------------
  // Setup picking interaction
  // ----------------------------------------------------------------------------
  const picker = vtkPointPicker.newInstance();
  //picker.setPickFromList(1);
  // Only try to pick cone points
  //picker.initializePickList();
  //picker.addPickList(actor);

  // Pick on mouse right click
  renderWindow.getInteractor().onRightButtonPress((callData) => {
    if (renderer !== callData.pokedRenderer) {
      return;
    }

    const pos = callData.position;
    const point = [pos.x, pos.y, 0.0];
    console.log(`Pick at: ${point}`);
    picker.pick(point, renderer);

    if (picker.getActors().length === 0) {
      const pickedPoint = picker.getPickPosition();
      console.log(`No point picked, default: ${pickedPoint}`);
    } else {
      const pickedPointId = picker.getPointId();
      console.log('Picked point: ', pickedPointId);

      const pointData = picker.getActors()[0].getMapper().getInputData().getPointData();

      var label = '';
        for(var i = 0; i < pointData.getNumberOfArrays(); i++) {
          label += `${pointData.getArrayName(i)}: ${pointData.getArray(i)[pickedPointId]}`;
        }

      console.log(label)

      const pickedPoints = picker.getPickedPositions();
      for (let i = 0; i < pickedPoints.length; i++) {
        const pickedPoint = pickedPoints[i];
        console.log(`Picked: ${pickedPoint}`);
        const sphere = vtkSphereSource.newInstance();
        sphere.setCenter(pickedPoint);
        sphere.setRadius(0.01);
        const sphereMapper = vtkMapper.newInstance();
        sphereMapper.setInputData(sphere.getOutputData());
        const sphereActor = vtkActor.newInstance();
        sphereActor.setMapper(sphereMapper);
        sphereActor.getProperty().setColor(0.0, 1.0, 0.0);
        renderer.addActor(sphereActor);
      }
    }
    renderWindow.render();
  });

  function onReady(sceneImporter) {
    sceneImporter.onReady(() => {
      renderWindow.render();

      if (!widgetCreated) {
        widgetCreated = true;

        const menuContainer = document.createElement('div');
        menuContainer.setAttribute('class', style.menuContainer);
        document.querySelector('body').appendChild(menuContainer)

        // Add UI to enable labels for different scene items
        labelWidget(
          fullScreenRenderer,
          menuContainer,
          document.querySelector('body'),
          sceneImporter.getScene(),
          renderWindow.render
        );

        // Add UI to dynamically change rendering settings
        controlWidget(
          menuContainer,
          sceneImporter.getScene(),
          renderWindow.render
        );
      }
    });

    window.addEventListener('dblclick', () => {
      sceneImporter.resetScene();
      renderWindow.render();
    });
  }

  if (options.url) {
    const sceneImporter = vtkHttpSceneLoader.newInstance({ renderer });
    sceneImporter.setUrl(options.url);
    onReady(sceneImporter);
  } else if (options.fileURL) {
    const progressContainer = document.createElement('div');
    progressContainer.setAttribute('class', style.progress);
    container.appendChild(progressContainer);

    const progressCallback = (progressEvent) => {
      if (progressEvent.lengthComputable) {
        const percent = Math.floor(
          (100 * progressEvent.loaded) / progressEvent.total
        );
        progressContainer.innerHTML = `Loading ${percent}%`;
      } else {
        progressContainer.innerHTML = macro.formatBytesToProperUnit(
          progressEvent.loaded
        );
      }
    };

    HttpDataAccessHelper.fetchBinary(options.fileURL, {
      progressCallback,
    }).then((zipContent) => {
      container.removeChild(progressContainer);
      const dataAccessHelper = DataAccessHelper.get('zip', {
        zipContent,
        callback: (zip) => {
          const sceneImporter = vtkHttpSceneLoader.newInstance({
            renderer,
            dataAccessHelper,
          });
          sceneImporter.setUrl('index.json');
          onReady(sceneImporter);
        },
      });
    });
  } else if (options.file) {
    const dataAccessHelper = DataAccessHelper.get('zip', {
      zipContent: options.file,
      callback: (zip) => {
        const sceneImporter = vtkHttpSceneLoader.newInstance({
          renderer,
          dataAccessHelper,
        });
        sceneImporter.setUrl('index.json');
        onReady(sceneImporter);
      },
    });
  }
}

export function initLocalFileLoader(container) {
  autoInit = false;
  const exampleContainer = document.querySelector('.content');
  const rootBody = document.querySelector('body');
  const myContainer = container || exampleContainer || rootBody;

  if (myContainer !== container) {
    myContainer.classList.add(style.fullScreen);
    rootBody.style.margin = '0';
    rootBody.style.padding = '0';
  } else {
    rootBody.style.margin = '0';
    rootBody.style.padding = '0';
  }

  const fileContainer = document.createElement('div');
  fileContainer.innerHTML = `<div class="${style.bigFileDrop}"/><input type="file" accept=".zip,.vtkjs" style="display: none;"/>`;
  myContainer.appendChild(fileContainer);

  const fileInput = fileContainer.querySelector('input');

  function handleFile(e) {
    preventDefaults(e);
    const dataTransfer = e.dataTransfer;
    const files = e.target.files || dataTransfer.files;
    if (files.length === 1) {
      myContainer.removeChild(fileContainer);
      const ext = files[0].name.split('.').slice(-1)[0];
      load(myContainer, { file: files[0], ext });
    }
  }

  fileInput.addEventListener('change', handleFile);
  fileContainer.addEventListener('drop', handleFile);
  fileContainer.addEventListener('click', (e) => fileInput.click());
  fileContainer.addEventListener('dragover', preventDefaults);
}

// Look at URL an see if we should load a file
// ?fileURL=https://data.kitware.com/api/v1/item/587003d08d777f05f44a5c98/download?contentDisposition=inline
const userParams = vtkURLExtract.extractURLParameters();

if (userParams.url || userParams.fileURL) {
  const exampleContainer = document.querySelector('.content');
  const rootBody = document.querySelector('body');
  const myContainer = exampleContainer || rootBody;
  if (myContainer) {
    myContainer.classList.add(style.fullScreen);
    rootBody.style.margin = '0';
    rootBody.style.padding = '0';
  }
  load(myContainer, userParams);
}

// Auto setup if no method get called within 100ms
setTimeout(() => {
  if (autoInit) {
    initLocalFileLoader();
  }
}, 100);
