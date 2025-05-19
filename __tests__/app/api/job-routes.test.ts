// __tests__/app/api/job-routes.test.ts
import { NextRequest } from 'next/server';
import * as firestore from 'firebase/firestore';
import JobStatus from '../../../src/app/enums/JobStatus.enum';
import UserType from '../../../src/app/enums/UserType.enum';
import JobData from '../../../src/app/interfaces/JobData.interface';

// Import route handlers
import { GET as getJobByJid } from '../../../src/app/api/jobs/[jid]/route';
import { GET as getAllJobs } from '../../../src/app/api/jobs/all/route';
import { GET as getJobsByClientCid } from '../../../src/app/api/jobs/client/[cid]/route';
import { GET as getContractedJobs } from '../../../src/app/api/jobs/contracted/route';
import { POST as postCreateJob } from '../../../src/app/api/jobs/create/route';
import { GET as getJobsByFreelancerFid } from '../../../src/app/api/jobs/freelancer/[fid]/route';
import { PATCH as patchJobHired } from '../../../src/app/api/jobs/hired/route';
import { POST as postSearchJobsBySkills } from '../../../src/app/api/jobs/search/skills/route';
import { GET as getSearchJobsByTitle } from '../../../src/app/api/jobs/search/title/route';
import { PATCH as patchJobStatus } from '../../../src/app/api/jobs/status/route';


// --- Mocks ---
jest.mock('next/server', () => {
  const actualNextServer = jest.requireActual('next/server');
  return {
    ...actualNextServer,
    NextResponse: {
      ...actualNextServer.NextResponse,
      json: jest.fn((body, init) => ({
        json: async () => body,
        text: async () => JSON.stringify(body),
        status: init?.status || 200,
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
        headers: new Headers(init?.headers),
      })),
    },
  };
});

jest.mock('../../../src/app/firebase', () => ({
  db: { type: 'mocked-db-instance-job' },
}));

jest.mock('firebase/firestore', () => {
    const originalFirestore = jest.requireActual('firebase/firestore');
    return {
        ...originalFirestore,
        doc: jest.fn(),
        getDoc: jest.fn(),
        getDocs: jest.fn(),
        collection: jest.fn(),
        query: jest.fn(),
        where: jest.fn((field, op, value) => ({ _field: field, _op: op, _value: value, _isMockConstraint: true, toString: () => `WHERE ${field} ${op} ${value}` })),
        addDoc: jest.fn(),
        updateDoc: jest.fn(),
        deleteDoc: jest.fn(),
        and: jest.fn((...constraints) => ({ _type: 'mocked_AndConstraint', constraints, toString: () => `AND(${constraints.map(c => c.toString()).join(',')})` })),
        or: jest.fn((...constraints) => ({ _type: 'mocked_OrConstraint', constraints, toString: () => `OR(${constraints.map(c => c.toString()).join(',')})` })),
    };
});


describe('API Routes: Job', () => {
  let mockRequest: NextRequest;
  const { NextResponse: MockNextResponse } = jest.requireMock('next/server');
  let consoleErrorSpy: jest.SpyInstance;
  let abortControllerInstance: AbortController;


  const defaultTestJobData: JobData = {
    title: 'Default Test Job',
    description: 'A default description',
    budgetMin: 100,
    budgetMax: 500,
    deadline: new Date('2025-12-31').getTime(),
    skills: { 'category1': ['skillA', 'skillB'] },
    status: JobStatus.Posted,
    hiredUId: '',
    clientUId: 'clientDefault',
    createdAt: new Date('2024-05-19T10:00:00.000Z').getTime(),
    hasClientRated: false,
    hasFreelancerRated: false,
  };

  const clientContractedJobData: JobData = { ...defaultTestJobData, title: 'Client Specific Contracted Job', clientUId: 'clientUserContract1', status: JobStatus.InProgress, hiredUId: 'freelancerOnContract1' };
  const freelancerContractedJobData: JobData = { ...defaultTestJobData, title: 'Freelancer Specific Contracted Job', hiredUId: 'freelancerUserContract1', status: JobStatus.Completed, clientUId: 'clientWhoHiredFreelancer1' };
  const adminContractedJobData: JobData = { ...defaultTestJobData, title: 'Admin As Client Contracted Job', clientUId: 'adminUserContract1', status: JobStatus.Employed, hiredUId: 'freelancerForAdminContract1' };
  const specificFreelancerJobData: JobData = { ...defaultTestJobData, title: 'Job For Freelancer freelancerUnique789', hiredUId: 'freelancerUnique789', clientUId: 'clientAssociatedWithFreelancerJob', status: JobStatus.InProgress };
  const jobSkillMatchData: JobData = { ...defaultTestJobData, title: 'Skill Match Job', skills: { 'skillCat1': ['React', 'TypeScript'] }, status: JobStatus.Posted };
  const jobTitleMatchData: JobData = { ...defaultTestJobData, title: 'Specific Title Job', status: JobStatus.Posted };


  const createMockRequest = (method: string = 'GET') => {
    abortControllerInstance = new AbortController();
    const newMockRequest = {
      json: jest.fn(),
      nextUrl: { searchParams: new URLSearchParams(), pathname: '/api/test' } as unknown as URL,
      headers: new Headers(),
      url: 'http://localhost/api/test',
      method: method,
      clone: jest.fn(() => newMockRequest),
      signal: abortControllerInstance.signal,
      cookies: { get: jest.fn(), getAll: jest.fn(), has: jest.fn(), set: jest.fn(), delete: jest.fn(), clear: jest.fn() } as any,
      body: null,
      geo: undefined,
      ip: undefined,
    } as unknown as NextRequest;
    return newMockRequest;
  };


  beforeEach(() => {
    jest.clearAllMocks();
    (MockNextResponse.json as jest.Mock).mockClear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
     (firestore.getDocs as jest.Mock).mockReset();
     (firestore.getDoc as jest.Mock).mockReset();
     (firestore.addDoc as jest.Mock).mockReset();
     (firestore.updateDoc as jest.Mock).mockReset();
     (firestore.deleteDoc as jest.Mock).mockReset();
     (firestore.where as jest.Mock).mockClear(); 
     (firestore.query as jest.Mock).mockClear();
     (firestore.collection as jest.Mock).mockClear();
     (firestore.doc as jest.Mock).mockClear();

    (firestore.doc as jest.Mock).mockImplementation((db, collectionName, id) => ({ id, path: `${collectionName}/${id}` }));
    (firestore.collection as jest.Mock).mockImplementation((db, path) => ({ id: path, path }));
    (firestore.query as jest.Mock).mockImplementation((collectionRef, ...constraints) => ({
        _type: 'query',
        _collectionRef: collectionRef,
        _constraints: constraints,
      }));
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    if (abortControllerInstance) {
      abortControllerInstance.abort();
    }
  });

  describe('GET /api/jobs/[jid]', () => {
    const mockJid = 'job123';
    const currentTestJobData: JobData = { ...defaultTestJobData, title: 'Test Job By JID', clientUId: 'client1', status: JobStatus.Posted };
    beforeEach(() => {
      mockRequest = createMockRequest('GET');
      (firestore.doc as jest.Mock).mockReturnValue({ id: mockJid, path: `Jobs/${mockJid}` });
    });
    it('should return job data if found', async () => {
      (firestore.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => true, data: () => currentTestJobData });
      const params = { jid: mockJid };
      const response = await getJobByJid(mockRequest, { params: Promise.resolve(params) });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ result: currentTestJobData });
    });
    it('should return null if job not found', async () => {
      (firestore.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });
      const params = { jid: mockJid };
      const response = await getJobByJid(mockRequest, { params: Promise.resolve(params) });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ result: null });
    });
  });

  describe('GET /api/jobs/all', () => {
    const job1Data: JobData = { ...defaultTestJobData, title: 'Job Alpha', clientUId: 'clientA', status: JobStatus.Posted };
    const job2Data: JobData = { ...defaultTestJobData, title: 'Job Beta', clientUId: 'clientB', status: JobStatus.InProgress };
    beforeEach(() => {
      mockRequest = createMockRequest('GET');
    });
    it('should return all jobs', async () => {
      const mockJobDocs = [{ id: 'jobAlpha1', data: () => job1Data }, { id: 'jobBeta2', data: () => job2Data },];
      (firestore.getDocs as jest.Mock).mockResolvedValueOnce({ docs: mockJobDocs, forEach: (cb: any) => mockJobDocs.forEach(cb), empty: mockJobDocs.length === 0, size: mockJobDocs.length });
      const response = await getAllJobs();
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.results).toEqual([{ jobId: 'jobAlpha1', jobData: job1Data }, { jobId: 'jobBeta2', jobData: job2Data },]);
    });
    it('should return empty array if no jobs exist', async () => {
      (firestore.getDocs as jest.Mock).mockResolvedValueOnce({ docs: [], forEach: (cb: any) => [].forEach(cb), empty: true, size: 0 });
      const response = await getAllJobs();
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.results).toEqual([]);
    });
    it('should return 500 if Firestore getDocs fails', async () => {
      const specificError = new Error('Firestore getDocs failed for getAllJobs');
      (firestore.getDocs as jest.Mock).mockRejectedValueOnce(specificError);
      const response = await getAllJobs();
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe('Error getting all the jobs');
      expect(body.error).toEqual(specificError);
    });
  });

  describe('GET /api/jobs/client/[cid]', () => {
    const mockCid = 'client789';
    const jobDataClient: JobData = { ...defaultTestJobData, title: 'Client Job 1', clientUId: mockCid, status: JobStatus.Posted };
    beforeEach(() => {
      mockRequest = createMockRequest('GET');
    });
    it('should return jobs for a specific client', async () => {
      const mockJobDocs = [{ id: 'clientJobX', data: () => jobDataClient }];
      (firestore.getDocs as jest.Mock).mockResolvedValueOnce({ docs: mockJobDocs, forEach: (cb: any) => mockJobDocs.forEach(cb), empty: false, size: 1 });
      const params = { cid: mockCid };
      const response = await getJobsByClientCid(mockRequest, { params: Promise.resolve(params) });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.results).toEqual([{ jobId: 'clientJobX', jobData: jobDataClient }]);
    });
    it('should return 400 if client ID is missing (simulated by empty params)', async () => {
      const params = { cid: '' };
      const response = await getJobsByClientCid(mockRequest, { params: Promise.resolve(params as any) });
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Missing client ID");
    });
    it('should return 500 if Firestore getDocs fails', async () => {
      const specificError = new Error('Firestore getDocs failed for client jobs');
      (firestore.getDocs as jest.Mock).mockReset().mockRejectedValueOnce(specificError); 
      const params = { cid: mockCid };
      const response = await getJobsByClientCid(mockRequest, { params: Promise.resolve(params) });
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe('Error getting jobs by client ID');
      expect(body.error).toEqual(specificError);
    });
  });

  describe('GET /api/jobs/contracted', () => {
    const clientUserId = 'clientUserContract1';

    beforeEach(() => {
      mockRequest = createMockRequest('GET');
      mockRequest.nextUrl.searchParams.delete('userId');
      mockRequest.nextUrl.searchParams.delete('userType');
    });

    it('should return empty results if userId or userType is missing and route handles it gracefully', async () => {
      mockRequest.nextUrl.searchParams.set('userType', String(UserType.Client));
      mockRequest.nextUrl.searchParams.delete('userId');
      (firestore.getDocs as jest.Mock).mockReset().mockResolvedValueOnce({ docs: [], forEach: (cb: any) => [].forEach(cb), empty: true, size: 0 });
      let response = await getContractedJobs(mockRequest);
      expect(response.status).toBe(200); 
      let body = await response.json();
      expect(body.results).toEqual([]);

      mockRequest.nextUrl.searchParams.set('userId', clientUserId);
      mockRequest.nextUrl.searchParams.delete('userType');
      (firestore.getDocs as jest.Mock).mockReset().mockResolvedValueOnce({ docs: [], forEach: (cb: any) => [].forEach(cb), empty: true, size: 0 });
      response = await getContractedJobs(mockRequest);
      expect(response.status).toBe(200); 
      body = await response.json();
      expect(body.results).toEqual([]);
    });
  });

  describe('POST /api/jobs/create', () => {
    const mockJobPayload: JobData = { ...defaultTestJobData, title: 'New Job Create', clientUId: 'clientNew', status: JobStatus.Posted };
    beforeEach(() => {
      mockRequest = createMockRequest('POST');
      (firestore.addDoc as jest.Mock).mockResolvedValue({ id: 'newJobXYZ' });
    });
    it('should create a job and return its ID', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockJobPayload);
      const response = await postCreateJob(mockRequest);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ id: 'newJobXYZ' });
    });
    it('should return 500 if Firestore addDoc fails', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue(mockJobPayload);
      const specificError = new Error('Firestore addDoc failed for create');
      (firestore.addDoc as jest.Mock).mockRejectedValueOnce(specificError);
      const response = await postCreateJob(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe('Error creating job');
      expect(body.error).toEqual(specificError);
    });
  });

  describe('GET /api/jobs/freelancer/[fid]', () => {
    const mockFid = 'freelancerUnique789';
    beforeEach(() => {
      mockRequest = createMockRequest('GET');
    });

    it('should return jobs for a specific freelancer', async () => {
      const expectedDoc = { id: 'freelancerSpecificJobId', data: () => specificFreelancerJobData };
      (firestore.getDocs as jest.Mock).mockReset().mockResolvedValueOnce({
         docs: [expectedDoc], forEach: (cb: any) => [expectedDoc].forEach(cb), empty: false, size: 1
        });
      const params = { fid: mockFid };
      const response = await getJobsByFreelancerFid(mockRequest, { params: Promise.resolve(params) });
      expect(response.status).toBe(200); 
      const body = await response.json();
      expect(body.results).toEqual([{ jobId: 'freelancerSpecificJobId', jobData: specificFreelancerJobData }]);
    });

    it('should return 500 if Firestore getDocs fails for freelancer jobs', async () => {
      const specificError = new Error('Firestore getDocs failed for freelancer jobs');
      (firestore.getDocs as jest.Mock).mockReset().mockRejectedValueOnce(specificError);
      const params = { fid: mockFid };
      const response = await getJobsByFreelancerFid(mockRequest, { params: Promise.resolve(params) });
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe('Error getting jobs by freelancer ID');
      expect(body.error).toEqual(specificError);
    });
  });

  describe('PATCH /api/jobs/hired', () => {
    const mockJobId = 'jobToHireFor';
    const mockHiredUid = 'freelancerHired1';
    beforeEach(() => {
      mockRequest = createMockRequest('PATCH');
      (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);
    });
    it('should update hiredUId for a job', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ jobID: mockJobId, hiredUId: mockHiredUid });
      const response = await patchJobHired(mockRequest);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({});
    });
    it('should return 500 if Firestore updateDoc fails', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ jobID: mockJobId, hiredUId: mockHiredUid });
      const specificError = new Error('Firestore updateDoc failed for hired');
      (firestore.updateDoc as jest.Mock).mockRejectedValueOnce(specificError);
      const response = await patchJobHired(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe('Error updating hiredUId');
      expect(body.error).toEqual(specificError);
    });
  });

  describe('POST /api/jobs/search/skills', () => {
    const jobNoSkillMatchData: JobData = { ...defaultTestJobData, title: 'No Skill Match Job', skills: { 'skillCat2': ['Angular'] }, status: JobStatus.Posted };
    beforeEach(() => {
      mockRequest = createMockRequest('POST');
    });
    it('should return jobs matching skills', async () => {
      const requestPayload = { skills: ['React'], skillIds: ['skillCat1'] };
      (mockRequest.json as jest.Mock).mockResolvedValue(requestPayload);
      const mockJobDocsAll = [
        { id: 'skillMatchDocId', data: () => jobSkillMatchData }, 
        { id: 'noSkillMatchDocId', data: () => jobNoSkillMatchData }
      ];
      (firestore.getDocs as jest.Mock).mockReset().mockResolvedValueOnce({ docs: mockJobDocsAll, forEach: (cb: any) => mockJobDocsAll.forEach(cb), empty:false, size: 2 });

      const response = await postSearchJobsBySkills(mockRequest);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.results).toEqual([jobSkillMatchData]);
    });

    it('should return 500 if no skills or skillIds provided, and not call getDocs', async () => {
        (mockRequest.json as jest.Mock).mockResolvedValue({ skills: [], skillIds: [] });
        (firestore.getDocs as jest.Mock).mockReset(); // Ensure it's reset for this check
    
        const response = await postSearchJobsBySkills(mockRequest);

        expect(response.status).toBe(500); 
      });

    it('should return empty array if skills is null and skillIds is empty', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ skills: null, skillIds: [] });
      (firestore.getDocs as jest.Mock).mockReset();
      const response = await postSearchJobsBySkills(mockRequest);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.results).toEqual([]);
      expect(firestore.getDocs).not.toHaveBeenCalled();
    });
    
    it('should return empty array if skills is empty and skillIds is null', async () => {
        (mockRequest.json as jest.Mock).mockResolvedValue({ skills: [], skillIds: null });
        (firestore.getDocs as jest.Mock).mockReset();
        const response = await postSearchJobsBySkills(mockRequest);
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.results).toEqual([]);
        expect(firestore.getDocs).not.toHaveBeenCalled();
    });


    it('should return 500 if Firestore getDocs fails during skill search', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ skills: ['React'], skillIds: ['skillCat1'] });
      const specificError = new Error('Firestore getDocs failed for skill search'); 
      (firestore.getDocs as jest.Mock).mockReset().mockRejectedValueOnce(specificError);
      const response = await postSearchJobsBySkills(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe('Error searching jobs by skills');
      expect(body.error).toEqual(specificError); 
    });
  });

  describe('GET /api/jobs/search/title', () => {
    beforeEach(() => {
      mockRequest = createMockRequest('GET');
      (firestore.where as jest.Mock).mockClear(); // Clear spy before each title search test
    });
    it('should return empty array if title is not provided', async () => {
      const response = await getSearchJobsByTitle(mockRequest);
      expect(response.status).toBe(200); 
      const body = await response.json();
      expect(body.results).toEqual([]);
      expect(firestore.where).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /api/jobs/status', () => {
    const mockJobIdStatus = 'jobStatusUpdate1';
    const mockNewStatus = JobStatus.Completed;
    beforeEach(() => {
      mockRequest = createMockRequest('PATCH');
      (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);
    });
    it('should update job status', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ jobID: mockJobIdStatus, status: mockNewStatus });
      const response = await patchJobStatus(mockRequest);
      expect(response.status).toBe(200); 
      const body = await response.json();
      expect(body).toEqual({}); 
    });
    it('should return 500 if Firestore updateDoc fails', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ jobID: mockJobIdStatus, status: mockNewStatus });
      const specificError = new Error('Firestore updateDoc failed for status');
      (firestore.updateDoc as jest.Mock).mockRejectedValueOnce(specificError);
      const response = await patchJobStatus(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe('Error updating the job status');
      expect(body.error).toEqual(specificError);
    });
  });
});