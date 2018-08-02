import Vue from 'vue';
import Vuex from 'vuex';

// imports of AJAX functions
import {
  fetchSurveys, fetchSurvey, saveSurveyResponse, postNewSurvey, authenticate, register,
} from '@/api';
import { isValidJwt, EventBus } from '@/utils';

Vue.use(Vuex);

const state = {
  // single source of data
  surveys: [],
  currentSurvey: {},
  user: {},
  jwt: '',
};

const actions = {
  // asynchronous operations
  loadSurveys(context) {
    return fetchSurveys()
      .then((response) => {
        // context.commit('setSurveys', { surveys: response })
        context.commit('setSurveys', { surveys: response.data });
      });
  },
  loadSurvey(context, { id }) {
    return fetchSurvey(id)
      .then((response) => {
        // context.commit('setSurvey', { survey: response })
        context.commit('setSurvey', { survey: response.data });
      });
  },
  addSurveyResponse(context) {
    return saveSurveyResponse(context.state.currentSurvey);
  },
  submitNewSurvey(context, survey) {
    return postNewSurvey(survey, context.state.jwt.token);
  },
  login(context, userData) {
    context.commit('setUserData', { userData });
    return authenticate(userData)
      .then(response => context.commit('setJwtToken', { jwt: response.data }))
      .catch((error) => {
        console.log('Error Authenticating: ', error);
        EventBus.$emit('failedAuthentication', error);
      });
  },
  register(context, userData) {
    context.commit('setUserData', { userData });
    return register(userData)
      .then(context.dispatch('login', userData))
      .catch((error) => {
        console.log('Error Registering: ', error);
        EventBus.$emit('failedRegistering', error);
      });
  },
};

const mutations = {
  // isolated data mutations
  setSurveys(payload) {
    state.surveys = payload.surveys;
  },
  setSurvey(payload) {
    const nQuestions = payload.survey.questions.length;
    for (let i = 0; i < nQuestions; i += 1) {
      Vue.set(payload.survey.questions[i], 'choice', null);
    }
    state.currentSurvey = payload.survey;
  },
  setChoice(payload) {
    const { questionId, choice } = payload;
    const nQuestions = state.currentSurvey.questions.length;
    for (let i = 0; i < nQuestions; i += 1) {
      if (state.currentSurvey.questions[i].id === questionId) {
        state.currentSurvey.questions[i].choice = choice;
        break;
      }
    }
  },
  setUserData(payload) {
    console.log('setUserData payload = ', payload);
    state.userData = payload.userData;
  },
  setJwtToken(payload) {
    console.log('setJwtToken payload = ', payload);
    localStorage.token = payload.jwt.token;
    state.jwt = payload.jwt;
  },
};

const getters = {
  // reusable data accessors
  isAuthenticated(state) {
    return isValidJwt(state.jwt.token);
  },
};

const store = new Vuex.Store({
  state,
  actions,
  mutations,
  getters,
});

export default store;
