class JobStore {
    private static clickedJobId: string = "";
  
    static setJobId(id: string): void {
      this.clickedJobId = id;
    }
  
    static getJobId(): string {
      return this.clickedJobId;
    }
  }
  
  export default JobStore;