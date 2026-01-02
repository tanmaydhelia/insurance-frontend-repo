export interface IHospital {
  id?: number;
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  isNetworkHospital: boolean;
}

export interface IHospitalRequest {
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  isNetworkHospital: boolean;
}