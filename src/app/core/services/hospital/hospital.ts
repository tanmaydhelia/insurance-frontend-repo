import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { Observable } from 'rxjs';
import { IHospital, IHospitalRequest } from '../../models/hospital.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Hospital {
  private BASE_PATH = '/hospitals';

  constructor(private api: Api) {}

  getAllHospitals(): Observable<IHospital[]> {
    return this.api.get<IHospital[]>(this.BASE_PATH);
  }

  getHospitalById(id: number): Observable<IHospital> {
    return this.api.get<IHospital>(`${this.BASE_PATH}/${id}`);
  }

  searchHospitals(name: string): Observable<IHospital[]> {
    const params = new HttpParams().set('name', name);
    return this.api.get<IHospital[]>(`${this.BASE_PATH}/search`, params);
  }

  registerHospital(hospital: IHospitalRequest): Observable<IHospital> {
    return this.api.post<IHospital>(this.BASE_PATH, hospital);
  }
}
