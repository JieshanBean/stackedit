const minPadding = 20;
const previewButtonWidth = 55;
const editorTopPadding = 10;
const navigationBarEditButtonsWidth = (36 * 14) + 8; // 14 buttons + 1 spacer
const navigationBarLeftButtonWidth = 38 + 4 + 15;
const navigationBarRightButtonWidth = 38 + 8;
const navigationBarSpinnerWidth = 24 + 8 + 5; // 5 for left margin
const navigationBarLocationWidth = 20;
const navigationBarSyncPublishButtonsWidth = 36 + 10;
const navigationBarTitleMargin = 8;
const maxTitleMaxWidth = 800;
const minTitleMaxWidth = 200;

const constants = {
  editorMinWidth: 320,
  explorerWidth: 250,
  sideBarWidth: 280,
  navigationBarHeight: 44,
  buttonBarWidth: 26,
  statusBarHeight: 20,
};

function computeStyles(state, localSettings, getters, styles = {
  showNavigationBar: !localSettings.showEditor || localSettings.showNavigationBar,
  showStatusBar: localSettings.showStatusBar,
  showEditor: localSettings.showEditor,
  showSidePreview: localSettings.showSidePreview && localSettings.showEditor,
  showPreview: localSettings.showSidePreview || !localSettings.showEditor,
  showSideBar: localSettings.showSideBar,
  showExplorer: localSettings.showExplorer,
  layoutOverflow: false,
}) {
  styles.innerHeight = state.bodyHeight;
  if (styles.showNavigationBar) {
    styles.innerHeight -= constants.navigationBarHeight;
  }
  if (styles.showStatusBar) {
    styles.innerHeight -= constants.statusBarHeight;
  }

  styles.innerWidth = state.bodyWidth;
  if (styles.showSideBar) {
    styles.innerWidth -= constants.sideBarWidth;
  }
  if (styles.showExplorer) {
    styles.innerWidth -= constants.explorerWidth;
  }

  let doublePanelWidth = styles.innerWidth - constants.buttonBarWidth;
  if (doublePanelWidth < constants.editorMinWidth) {
    doublePanelWidth = constants.editorMinWidth;
    styles.innerWidth = constants.editorMinWidth + constants.buttonBarWidth;
    styles.layoutOverflow = true;
  }

  if (styles.showSidePreview && doublePanelWidth / 2 < constants.editorMinWidth) {
    styles.showSidePreview = false;
    styles.showPreview = false;
    styles.layoutOverflow = false;
    return computeStyles(state, localSettings, getters, styles);
  }

  const computedSettings = getters['data/computedSettings'];
  styles.fontSize = 18;
  styles.textWidth = 990;
  if (doublePanelWidth < 1120) {
    styles.fontSize -= 1;
    styles.textWidth = 910;
  }
  if (doublePanelWidth < 1040) {
    styles.textWidth = 830;
  }
  styles.textWidth *= computedSettings.maxWidthFactor;
  if (doublePanelWidth < styles.textWidth) {
    styles.textWidth = doublePanelWidth;
  }
  if (styles.textWidth < 640) {
    styles.fontSize -= 1;
  }
  styles.fontSize *= computedSettings.fontSizeFactor;

  const bottomPadding = Math.floor(styles.innerHeight / 2);
  const panelWidth = Math.floor(doublePanelWidth / 2);
  styles.previewWidth = styles.showSidePreview ?
    panelWidth :
    styles.innerWidth;
  const previewLeftPadding = Math.max(
    Math.floor((styles.previewWidth - styles.textWidth) / 2), minPadding);
  let previewRightPadding = previewLeftPadding;
  if (!styles.showEditor && previewRightPadding < previewButtonWidth) {
    previewRightPadding = previewButtonWidth;
  }
  styles.previewPadding = `${editorTopPadding}px ${previewRightPadding}px ${bottomPadding}px ${previewLeftPadding}px`;
  styles.editorWidth = styles.showSidePreview ?
    panelWidth :
    doublePanelWidth;
  const editorSidePadding = Math.max(
    Math.floor((styles.editorWidth - styles.textWidth) / 2), minPadding);
  styles.editorPadding = `${editorTopPadding}px ${editorSidePadding}px ${bottomPadding}px`;

  styles.titleMaxWidth = styles.innerWidth -
    navigationBarLeftButtonWidth -
    navigationBarRightButtonWidth -
    navigationBarSpinnerWidth;
  if (styles.showEditor) {
    const syncLocations = getters['syncLocation/current'];
    const publishLocations = getters['publishLocation/current'];
    styles.titleMaxWidth -= navigationBarEditButtonsWidth +
      (navigationBarLocationWidth * (syncLocations.length + publishLocations.length)) +
      (navigationBarSyncPublishButtonsWidth * 2) +
      navigationBarTitleMargin;
    if (styles.titleMaxWidth + navigationBarEditButtonsWidth < minTitleMaxWidth) {
      styles.hideLocations = true;
    }
  }
  styles.titleMaxWidth = Math.min(styles.titleMaxWidth, maxTitleMaxWidth);
  styles.titleMaxWidth = Math.max(styles.titleMaxWidth, minTitleMaxWidth);
  return styles;
}

export default {
  namespaced: true,
  state: {
    canUndo: false,
    canRedo: false,
    bodyWidth: 0,
    bodyHeight: 0,
  },
  mutations: {
    setCanUndo: (state, value) => {
      state.canUndo = value;
    },
    setCanRedo: (state, value) => {
      state.canRedo = value;
    },
    updateBodySize: (state) => {
      state.bodyWidth = document.body.clientWidth;
      state.bodyHeight = document.body.clientHeight;
    },
  },
  getters: {
    constants: () => constants,
    styles: (state, getters, rootState, rootGetters) => {
      const localSettings = rootGetters['data/localSettings'];
      return computeStyles(state, localSettings, rootGetters);
    },
  },
  actions: {
    updateBodySize({ commit, dispatch, rootGetters }) {
      commit('updateBodySize');
      // Make sure both explorer and side bar are not open if body width is small
      const localSettings = rootGetters['data/localSettings'];
      dispatch('data/toggleExplorer', localSettings.showExplorer, { root: true });
    },
  },
};
