import {
  Component,
  OnInit,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { WeatherService } from '../../services/weather';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  weather: any = null;
  loading = false;
  error = '';

  constructor(
    private weatherService: WeatherService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWeatherByCurrentLocation();
  }

  loadWeatherByCurrentLocation(): void {
    this.loading = true;
    this.error = '';

    if (!navigator.geolocation) {
      this.loadWeather(28.53, 77.55);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.ngZone.run(() => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          console.log('Latitude:', lat);
          console.log('Longitude:', lon);

          this.loadWeather(lat, lon);
        });
      },
      (error) => {
        console.error('Location Error:', error);

        this.ngZone.run(() => {
          this.loadWeather(28.53, 77.55);
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  loadWeather(lat: number, lon: number): void {
    this.weatherService.getWeather(lat, lon).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          console.log('Weather Response:', res);

          this.weather = { ...(res?.data || {}) };
          this.loading = false;

          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Weather API Error:', err);

        this.ngZone.run(() => {
          this.loading = false;
          this.error = 'Unable to load weather information.';
          this.cdr.detectChanges();
        });
      },
    });
  }

  refreshWeather(): void {
    this.loadWeatherByCurrentLocation();
  }

  getAqiPercent(index: number): string {
    if (!index || index < 1) {
      return '0%';
    }

    return `${Math.min(((index - 1) / 5) * 100, 100).toFixed(0)}%`;
  }

  getAqiLabel(index: number): string {
    const labels: Record<number, string> = {
      1: 'Good',
      2: 'Moderate',
      3: 'Unhealthy for Sensitive',
      4: 'Unhealthy',
      5: 'Very Unhealthy',
      6: 'Hazardous',
    };

    return labels[index] ?? 'Unknown';
  }
}