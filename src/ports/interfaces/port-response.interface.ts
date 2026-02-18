export interface PortResponse {
  id: string;
  name: string;
  islands: Islands | null;
}

export interface Islands {
  id: string;
  name: string;
}
