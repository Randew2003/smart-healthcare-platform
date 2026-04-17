import axios from "axios";

const API = "http://localhost:4001/api/appointments";

export const createAppointment = (data) => {
  return axios.post(API, data);
};

export const getMyAppointments = (patientId) => {
  return axios.get(`${API}/patient/${patientId}`);
};

