import { Injectable } from '@angular/core';
import { Api } from './api';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  constructor(private api: Api) {}

  // WEATHER API
getWeather(lat: number, lon: number) {
  return this.api.get(`weather?lat=${lat}&lon=${lon}`);
}
}