export interface Task {
    id: string;
    text: string;
    dayId: string;
    hours: number;
  }
  
  export interface Day {
    id: string;
    date: Date;
  }