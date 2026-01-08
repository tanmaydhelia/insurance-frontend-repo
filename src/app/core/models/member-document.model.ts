export interface IMemberDocumentRequest {
  userId: number;
  aadhaarNumber: string;
  photo: File;
  medicalCheckupDoc: File;
}

export interface IMemberDocumentResponse {
  id: number;
  userId: number;
  aadhaarNumber: string;
  photoUrl: string;
  medicalCheckupDocUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDocumentExistsResponse {
  exists: boolean;
}
