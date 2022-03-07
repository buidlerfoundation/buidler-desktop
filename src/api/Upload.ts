import ApiCaller from './ApiCaller';

export const uploadFile = (teamId: string, attachmentId: string, file: any) => {
  const data = new FormData();
  data.append('team_id', teamId);
  data.append('attachment_id', attachmentId);
  data.append('file', file);
  return ApiCaller.post(`file`, data);
};

export const removeFile = (fileId: string) =>
  ApiCaller.delete(`file/${fileId}`);
