import { NextRequest } from 'next/server';
import * as firestore from 'firebase/firestore';
import * as firebaseStorage from 'firebase/storage'; 
import { db, storage } from '../../../src/app/firebase'; 

// Import route handlers 
import { PATCH as patchAvatar } from '../../../src/app/api/database/avatar/route';
import { POST as postFile } from '../../../src/app/api/database/file/route';
import { GET as getPending } from '../../../src/app/api/database/pending/route';
import { PATCH as patchRemoveSkill } from '../../../src/app/api/database/removeSkill/route';
import { PATCH as patchSkills, GET as getSkills } from '../../../src/app/api/database/skills/route';
import { PATCH as patchStatus } from '../../../src/app/api/database/status/route';
import { PATCH as patchType } from '../../../src/app/api/database/type/route';
import { GET as getUser } from '../../../src/app/api/database/user/route';
import { PATCH as patchUsername } from '../../../src/app/api/database/username/route';

import UserStatus from '../../../src/app/enums/UserStatus.enum'; 

// Global Mocks
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
  db: { type: 'mocked-db-instance-all' },
  storage: { type: 'mocked-storage-instance-all' },
}));

jest.mock('firebase/firestore', () => {
    const originalFirestore = jest.requireActual('firebase/firestore');
    return {
        ...originalFirestore,
        doc: jest.fn(),
        updateDoc: jest.fn(),
        getDoc: jest.fn(),
        getDocs: jest.fn(),
        collection: jest.fn(),
        query: jest.fn(),
        where: jest.fn(),
    };
});

jest.mock('firebase/storage', () => {
  const originalStorage = jest.requireActual('firebase/storage');
  return {
    ...originalStorage,
    ref: jest.fn(),
    uploadBytesResumable: jest.fn(),
    getDownloadURL: jest.fn(),
  };
});


// Global Test Variables and Helpers
let mockRequest: NextRequest;
const { NextResponse: MockNextResponse } = jest.requireMock('next/server');
let consoleErrorSpy: jest.SpyInstance;
let consoleWarnSpy: jest.SpyInstance;
let consoleLogSpy: jest.SpyInstance;

if (typeof TextEncoder === 'undefined') {
  const util = require('util');
  global.TextEncoder = util.TextEncoder;
  global.TextDecoder = util.TextDecoder; // Also include TextDecoder if you might need it
}


const createMockRequest = (
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'GET',
    searchParams?: URLSearchParams,
    body?: any,
    formData?: FormData
) => {
    const baseUrl = 'http://localhost/api/database/test';
    const url = `${baseUrl}${searchParams ? `?${searchParams.toString()}` : ''}`;

    const newMockRequest = {
        url: url,
        nextUrl: { searchParams: searchParams || new URLSearchParams(), pathname: '/api/database/test' } as unknown as URL,
        method: method,
        json: jest.fn().mockResolvedValue(body), // Mock for req.json()
        formData: jest.fn().mockResolvedValue(formData || (body instanceof FormData ? body : new FormData())), 
        headers: new Headers(),
        clone: jest.fn(() => newMockRequest),
        signal: new AbortController().signal,
        cookies: { get: jest.fn(), getAll: jest.fn(), has: jest.fn(), set: jest.fn(), delete: jest.fn(), clear: jest.fn() } as any,
        body: body && !(body instanceof FormData) ? { tee: jest.fn().mockReturnValue([null, null]) } : null,
        geo: undefined,
        ip: undefined,
    } as unknown as NextRequest;
    return newMockRequest;
};


// Test Suites 
describe('Database API Routes', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        (MockNextResponse.json as jest.Mock).mockClear();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});


        // Reset Firestore mocks
        (firestore.doc as jest.Mock).mockReset().mockImplementation((db, collectionName, id) => ({ id, path: `${collectionName}/${id}` }));
        (firestore.collection as jest.Mock).mockReset().mockImplementation((db, path) => ({ id: path, path }));
        (firestore.query as jest.Mock).mockReset().mockImplementation((collectionRef, ...constraints) => ({
            _type: 'query',
            _collectionRef: collectionRef,
            _constraints: constraints,
        }));
        (firestore.where as jest.Mock).mockReset().mockImplementation((field, op, value) => ({ _field: field, _op: op, _value: value }));
        (firestore.updateDoc as jest.Mock).mockReset();
        (firestore.getDoc as jest.Mock).mockReset();
        (firestore.getDocs as jest.Mock).mockReset();


        // Reset Storage mocks
        (firebaseStorage.ref as jest.Mock).mockReset();
        (firebaseStorage.uploadBytesResumable as jest.Mock).mockReset();
        (firebaseStorage.getDownloadURL as jest.Mock).mockReset();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    // Avatar Tests
    describe('PATCH /api/database/avatar', () => {
        it('should update user avatar and return 200 on success', async () => {
            const userID = 'testUserAvatar1';
            const avatar = 'newAvatar.png';
            const searchParams = new URLSearchParams({ userID, avatar });
            mockRequest = createMockRequest('PATCH', searchParams);
            (firestore.updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

            const response = await patchAvatar(mockRequest);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body).toEqual({});
            expect(firestore.doc).toHaveBeenCalledWith(db, "users", userID);
            expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), { avatar });
        });

        it('should return 500 if userID is missing for avatar update', async () => {
            const avatar = 'newAvatar.png';
            const searchParams = new URLSearchParams({ avatar });
            mockRequest = createMockRequest('PATCH', searchParams);

            const response = await patchAvatar(mockRequest);
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body.message).toBe("Error setting user avatar");
        });

        it('should return 500 if firestore.updateDoc fails for avatar', async () => {
            const userID = 'testUserAvatarFail';
            const avatar = 'failAvatar.png';
            const searchParams = new URLSearchParams({ userID, avatar });
            mockRequest = createMockRequest('PATCH', searchParams);
            const firestoreError = new Error('Firestore update failed for avatar');
            (firestore.updateDoc as jest.Mock).mockRejectedValueOnce(firestoreError);

            const response = await patchAvatar(mockRequest);
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body.message).toBe("Error setting user avatar");
            expect(body.error).toEqual(firestoreError);
        });
    });

    // upload File Tests
    describe('POST /api/database/file', () => {
    const mockFileContent = 'dummy content';
    const mockFileArrayBuffer = new TextEncoder().encode(mockFileContent).buffer;
    const mockFile = new File([mockFileContent], 'testfile.png', { type: 'image/png' }) as File & { arrayBuffer: () => Promise<ArrayBuffer> };
    mockFile.arrayBuffer = jest.fn().mockResolvedValue(mockFileArrayBuffer); // Mocking arrayBuffer that would be put into body 
    const mockPath = 'test-path';
    const mockName = 'test-name.png';
    const mockDownloadURL = 'http://mockurl.com/test-path/test-name.png';

    beforeEach(() => {
        (mockFile.arrayBuffer as jest.Mock).mockClear().mockResolvedValue(mockFileArrayBuffer);

        (firebaseStorage.ref as jest.Mock).mockReturnValue({ fullPath: `<span class="math-inline">\{mockPath\}/</span>{mockName}` });
        (firebaseStorage.uploadBytesResumable as jest.Mock).mockImplementation(() => {
          const mockUploadTask: any = {
            on: jest.fn((event, complete) => {
              if (event === 'state_changed' && typeof complete === 'function') {
                mockUploadTask.snapshot = { ref: { fullPath: `<span class="math-inline">\{mockPath\}/</span>{mockName}` } };
                complete();
              }
              return jest.fn(); 
            }),
            snapshot: { ref: { fullPath: `<span class="math-inline">\{mockPath\}/</span>{mockName}` } }
          };
          return mockUploadTask;
        });
        (firebaseStorage.getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadURL);
    });  

    it('should handle firebase upload error for file', async () => {
        const formData = new FormData();
        formData.append('file', mockFile as any); 
        formData.append('path', mockPath);
        formData.append('name', mockName);
        mockRequest = createMockRequest('POST', undefined, undefined, formData);

        const storageError = { code: 'storage/unauthorized', message: "Permission denied." } as firebaseStorage.StorageError;
        (firebaseStorage.uploadBytesResumable as jest.Mock).mockImplementation(() => {
            const mockUploadTask: any = {
                on: jest.fn((event, progressCallback, errorCallback, completeCallback) => {
                    if (event === 'state_changed' && typeof errorCallback === 'function') {
                        errorCallback(storageError); 
                    }
                    return jest.fn();
                }),
                snapshot: { ref: { fullPath: `<span class="math-inline">\{mockPath\}/</span>{mockName}` } }
            };
            return mockUploadTask;
        });

        const response = await postFile(mockRequest);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.message).toBe('Server error during file upload.');
        expect(body.error).toBe("User doesn't have permission to access the object."); 
        expect(mockFile.arrayBuffer).toHaveBeenCalled(); 
    });
});

    // Pending users Tests 
    describe('GET /api/database/pending', () => {
        const mockPendingUsersData = [
            { uid: 'pending1', status: UserStatus.Pending, type: 0, username: 'P User 1', date: '2024-01-01' },
        ];
        it('should return pending users', async () => {
            const mockUserDocs = mockPendingUsersData.map(user => ({
                id: user.uid,
                data: () => ({ ...user }),
            }));
            (firestore.getDocs as jest.Mock).mockResolvedValueOnce({ docs: mockUserDocs });
            mockRequest = createMockRequest('GET');

            const response = await getPending(); 
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.result).toEqual(mockPendingUsersData);
            expect(firestore.collection).toHaveBeenCalledWith(db, 'users');
            expect(firestore.where).toHaveBeenCalledWith('status', '==', UserStatus.Pending);
        });

        it('should return empty array if no pending users', async () => {
            (firestore.getDocs as jest.Mock).mockResolvedValueOnce({ docs: [] });
             mockRequest = createMockRequest('GET');

            const response = await getPending();
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.result).toEqual([]);
        });
    });

    // Removing Skill Tests
    describe('PATCH /api/database/removeSkill', () => {
        const userID = 'userRemoveSkill1';
        const skillNameToRemove = 'OldSkill';
        const initialSkills = { domain: ['OldSkill', 'AnotherSkill'] };

        it('should remove a skill successfully', async () => {
            const searchParams = new URLSearchParams({ userID, skillName: skillNameToRemove });
            mockRequest = createMockRequest('PATCH', searchParams);
            (firestore.getDoc as jest.Mock).mockResolvedValueOnce({
                exists: () => true, data: () => ({ skills: JSON.parse(JSON.stringify(initialSkills)) })
            });
            (firestore.updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

            const response = await patchRemoveSkill(mockRequest);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.message).toBe(`Skill "${skillNameToRemove}" removed successfully`);
            expect(body.skills.domain).toEqual(['AnotherSkill']);
        });

        it('should return 400 if userID is missing for removeSkill', async () => {
            const searchParams = new URLSearchParams({ skillName: skillNameToRemove });
             mockRequest = createMockRequest('PATCH', searchParams);
            const response = await patchRemoveSkill(mockRequest);
            expect(response.status).toBe(400);
        });

        it('should return 400 if skillName is missing for removeSkill', async () => {
            const searchParams = new URLSearchParams({ userID });
            mockRequest = createMockRequest('PATCH', searchParams);
            const response = await patchRemoveSkill(mockRequest);
            expect(response.status).toBe(400);
        });

        it('should return 404 if user not found for removeSkill', async () => {
            const searchParams = new URLSearchParams({ userID, skillName: skillNameToRemove });
            mockRequest = createMockRequest('PATCH', searchParams);
            (firestore.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });
            const response = await patchRemoveSkill(mockRequest);
            expect(response.status).toBe(404);
        });
         it('should return 404 if skill to remove is not found', async () => {
            const skillNotFound = "NonExistentSkill";
            const searchParams = new URLSearchParams({ userID, skillName: skillNotFound });
            mockRequest = createMockRequest('PATCH', searchParams);
            (firestore.getDoc as jest.Mock).mockResolvedValueOnce({
                exists: () => true, data: () => ({ skills: initialSkills })
            });
            const response = await patchRemoveSkill(mockRequest);
            const body = await response.json();
            expect(response.status).toBe(404);
            expect(body.message).toBe(`Skill "${skillNotFound}" not found for this user`);
        });
    });

    //Skills Tests for pach and get
    describe('/api/database/skills', () => {
        const userIDSkills = 'userSkillsTest1';

        describe('PATCH', () => {
            const skillsPayload = { frontend: ['ReactNew'], backend: ['NodeNew'] };
            it('should update user skills', async () => {
                const searchParams = new URLSearchParams({ userID: userIDSkills });
                mockRequest = createMockRequest('PATCH', searchParams, skillsPayload);
                (firestore.getDoc as jest.Mock).mockResolvedValueOnce({
                    exists: () => true, data: () => ({ skills: { frontend: ['OldReact'] } })
                });
                (firestore.updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

                const response = await patchSkills(mockRequest);
                const body = await response.json();

                expect(response.status).toBe(200);
                expect(body.message).toBe('Skills updated successfully');
                expect(body.skills.frontend).toContain('ReactNew');
                expect(body.skills.frontend).toContain('OldReact'); 
                expect(body.skills.backend).toEqual(['NodeNew']);
            });
             it('should return 400 if userID is missing for PATCH skills', async () => {
                mockRequest = createMockRequest('PATCH', undefined, skillsPayload);
                const response = await patchSkills(mockRequest);
                expect(response.status).toBe(400);
            });
            it('should return 400 if skill data is missing for PATCH skills', async () => {
                const searchParams = new URLSearchParams({ userID: userIDSkills });
                mockRequest = createMockRequest('PATCH', searchParams, {}); 
                const response = await patchSkills(mockRequest);
                expect(response.status).toBe(400);
            });
            it('should return 404 if user not found for PATCH skills', async () => {
                const searchParams = new URLSearchParams({ userID: userIDSkills });
                 mockRequest = createMockRequest('PATCH', searchParams, skillsPayload);
                (firestore.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });
                const response = await patchSkills(mockRequest);
                expect(response.status).toBe(404);
            });
        });

        describe('GET', () => {
            const userSkillsData = { programming: ['Go', 'Rust'] };
            it('should get user skills', async () => {
                const searchParams = new URLSearchParams({ userID: userIDSkills });
                mockRequest = createMockRequest('GET', searchParams);
                (firestore.getDoc as jest.Mock).mockResolvedValueOnce({
                    exists: () => true, data: () => ({ skills: userSkillsData })
                });

                const response = await getSkills(mockRequest);
                const body = await response.json();

                expect(response.status).toBe(200);
                expect(body.result).toEqual(userSkillsData);
            });
            it('should return null (with 200 status) if userID is invalid for GET skills', async () => {
                mockRequest = createMockRequest('GET', new URLSearchParams({ userID: '' }));
                const response = await getSkills(mockRequest);
                const body = await response.json();
                expect(response.status).toBe(200);
                expect(body.result).toBeNull();
            });
            it('should return empty object (with 200 status) if user has no skills property for GET skills', async () => {
                const searchParams = new URLSearchParams({ userID: userIDSkills });
                mockRequest = createMockRequest('GET', searchParams);
                (firestore.getDoc as jest.Mock).mockResolvedValueOnce({
                    exists: () => true, data: () => ({ someOtherData: 'value' }) 
                });
                const response = await getSkills(mockRequest);
                const body = await response.json();
                expect(response.status).toBe(200);
                expect(body.result).toEqual({});
            });
             it('should return null (with 200 status) if user doc not found for GET skills', async () => {
                const searchParams = new URLSearchParams({ userID: userIDSkills });
                mockRequest = createMockRequest('GET', searchParams);
                (firestore.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });
                const response = await getSkills(mockRequest);
                const body = await response.json();
                expect(response.status).toBe(200);
                expect(body.result).toBeNull();
            });
        });
    });

    // Status Tests 
    describe('PATCH /api/database/status', () => {
        const userIDStatus = 'userStatusTest1';
        const newStatus = 1; // Example status
        it('should update user status', async () => {
            const searchParams = new URLSearchParams({ userID: userIDStatus, status: newStatus.toString() });
            mockRequest = createMockRequest('PATCH', searchParams);
            (firestore.updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

            const response = await patchStatus(mockRequest);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body).toEqual({});
            expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), { status: newStatus });
        });
        it('should return 500 if userID is missing for status update', async () => {
            const searchParams = new URLSearchParams({ status: newStatus.toString() });
            mockRequest = createMockRequest('PATCH', searchParams);
            const response = await patchStatus(mockRequest);
            expect(response.status).toBe(500);
        });
         it('should return 500 if firestore update fails for status', async () => {
            const searchParams = new URLSearchParams({ userID: userIDStatus, status: newStatus.toString() });
            mockRequest = createMockRequest('PATCH', searchParams);
            const firestoreError = new Error("Update failed");
            (firestore.updateDoc as jest.Mock).mockRejectedValueOnce(firestoreError);
            const response = await patchStatus(mockRequest);
            const body = await response.json();
            expect(response.status).toBe(500);
            expect(body.error).toEqual(firestoreError);
        });
    });

    // Type Tests
    describe('PATCH /api/database/type', () => {
        const userIDType = 'userTypeTest1';
        const newType = 2; 
        it('should update user type', async () => {
            const searchParams = new URLSearchParams({ userID: userIDType, type: newType.toString() });
            mockRequest = createMockRequest('PATCH', searchParams);
            (firestore.updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

            const response = await patchType(mockRequest);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body).toEqual({});
            expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), { type: newType });
        });
        it('should return 500 if userID is missing for type update', async () => {
            const searchParams = new URLSearchParams({ type: newType.toString() });
            mockRequest = createMockRequest('PATCH', searchParams);
            const response = await patchType(mockRequest);
            expect(response.status).toBe(500);
        });
        it('should return 500 if firestore update fails for type', async () => {
            const searchParams = new URLSearchParams({ userID: userIDType, type: newType.toString() });
            mockRequest = createMockRequest('PATCH', searchParams);
            const firestoreError = new Error("Update type failed");
            (firestore.updateDoc as jest.Mock).mockRejectedValueOnce(firestoreError);
            const response = await patchType(mockRequest);
            const body = await response.json();
            expect(response.status).toBe(500);
            expect(body.error).toEqual(firestoreError);
        });
    });

    //  get User Tests 
    describe('GET /api/database/user', () => {
        const userIDInfo = 'userInfoTest1';
        const userData = { username: 'TestUsername', email: 'test@example.com' };
        it('should get user information', async () => {
            const searchParams = new URLSearchParams({ userID: userIDInfo });
            mockRequest = createMockRequest('GET', searchParams);
            (firestore.getDoc as jest.Mock).mockResolvedValueOnce({
                exists: () => true, data: () => userData
            });

            const response = await getUser(mockRequest);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.result).toEqual(userData);
        });
        it('should return null (with 200 status) if userID is invalid for GET user', async () => {
            mockRequest = createMockRequest('GET', new URLSearchParams({ userID: '' }));
            const response = await getUser(mockRequest);
            const body = await response.json();
            expect(response.status).toBe(200);
            expect(body.result).toBeNull();
        });
        it('should return null (with 200 status) if user not found for GET user', async () => {
            const searchParams = new URLSearchParams({ userID: userIDInfo });
            mockRequest = createMockRequest('GET', searchParams);
            (firestore.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });
            const response = await getUser(mockRequest);
            const body = await response.json();
            expect(response.status).toBe(200);
            expect(body.result).toBeNull();
        });
    });

    // Username Tests
    describe('PATCH /api/database/username', () => {
        const userIDUsername = 'userUsernameTest1';
        const newUsername = 'MyNewUsername';
        it('should update username', async () => {
            const searchParams = new URLSearchParams({ userID: userIDUsername, name: newUsername });
            mockRequest = createMockRequest('PATCH', searchParams);
            (firestore.updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

            const response = await patchUsername(mockRequest);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body).toEqual({});
            expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), { username: newUsername });
        });
        it('should return 500 if userID is missing for username update', async () => {
            const searchParams = new URLSearchParams({ name: newUsername });
            mockRequest = createMockRequest('PATCH', searchParams);
            const response = await patchUsername(mockRequest);
            expect(response.status).toBe(500);
        });
        it('should return 500 if firestore update fails for username', async () => {
            const searchParams = new URLSearchParams({ userID: userIDUsername, name: newUsername });
            mockRequest = createMockRequest('PATCH', searchParams);
            const firestoreError = new Error("Update username failed");
            (firestore.updateDoc as jest.Mock).mockRejectedValueOnce(firestoreError);
            const response = await patchUsername(mockRequest);
            const body = await response.json();
            expect(response.status).toBe(500);
            expect(body.error).toEqual(firestoreError);
        });
    });
});