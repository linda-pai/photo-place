export interface EventProps {
  data: string;
  eventName: string;
  coverImg: string;
  userId: string;
  isShow: boolean;
  isCompleteUpload: boolean;
  eventId: string;
  date: string;
}

export interface EventOption {
  eventName: string;
  eventId: string;
  date: string;
  value: string;
}

export interface ChildOption {
  value: string;
  title: string;
  date: string;
}

export interface ParentOption {
  value: string;
  title: string;
  children: ChildOption[];
}
