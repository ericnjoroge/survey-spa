import Vue from 'vue'
import Vuex from 'vuex'

// imports of AJAX functions
import { fetchSurveys } from '@/api'

Vue.use(Vuex)

const state = {
  //single source of data
  surveys: []
}

const actions = {
  //asynchronous operations
  loadSurveys(context) {
    return fetchSurveys()
      .then((response) => context.commit('setSurveys', { surveys: response }))
  }
}

const mutations = {
  //isolated data mutations
  setSurveys(state, payload) {
    state.surveys = payload.surveys
  }
}

const getters = {
  //reusable data accessors
}

const store = new Vuex.Store({
  state,
  actions,
  mutations,
  getters
})

export default store
