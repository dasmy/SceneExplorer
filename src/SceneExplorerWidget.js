import vtkHttpSceneLoader from '@kitware/vtk.js/IO/Core/HttpSceneLoader';
import style from './SceneExplorer.module.css';


const SETTINGS_OPTIONS = {
  defaultSettings: {},
  Surface: {
    actor: {
      visibility: true,
    },
    property: {
      Representation: 2,
      edgeVisibility: false,
    },
  },
  'Surface with Edges': {
    actor: {
      visibility: true,
    },
    property: {
      Representation: 2,
      edgeVisibility: true,
      edgeColor: [0.5, 0.5, 0.5],
    },
  },
  Wireframe: {
    actor: {
      visibility: true,
    },
    property: {
      Representation: 1,
      edgeVisibility: false,
    },
  },
  Points: {
    actor: {
      visibility: true,
    },
    property: {
      Representation: 0,
      edgeVisibility: false,
    },
  },
  Hidden: {
    actor: {
      visibility: false,
    },
    property: {
      edgeVisibility: false,
    },
  },
};

const OPTIONS_HTML_STR = Object.keys(SETTINGS_OPTIONS)
  .map((name) => `<option value="${name}">${name}</option>`)
  .join('');

export default function addWidget(container, sceneItems, render) {
  function handleChange(e) {
    const itemIdx = Number(e.target.name);
    const value = e.target.value;
    if (sceneItems[itemIdx][value]) {
      vtkHttpSceneLoader.applySettings(
        sceneItems[itemIdx],
        sceneItems[itemIdx][value]
      );
    } else if (SETTINGS_OPTIONS[value]) {
      vtkHttpSceneLoader.applySettings(
        sceneItems[itemIdx],
        SETTINGS_OPTIONS[value]
      );
    }
    if (render) {
      render();
    }
  }

  const listStr = sceneItems
    .map(
      (item, idx) =>
        `<li><select name="${idx}">${OPTIONS_HTML_STR}</select>&nbsp;&nbsp;${item.name}</li>`
    )
    .join('');

  const listContainer = document.createElement('ul');
  listContainer.innerHTML = listStr;
  listContainer.setAttribute('class', style.menu);
  container.appendChild(listContainer);

  document.querySelector('body').addEventListener('keypress', (e) => {
    if (String.fromCharCode(e.charCode) === 'c') {
      if (listContainer.style.display === 'none') {
        listContainer.style.display = 'block';
      } else {
        listContainer.style.display = 'none';
      }
    }
  });

  const selectList = listContainer.querySelectorAll('select');
  for (let i = 0; i < selectList.length; i++) {
    const selectElem = selectList[i];
    selectElem.addEventListener('change', handleChange);
  }
}
