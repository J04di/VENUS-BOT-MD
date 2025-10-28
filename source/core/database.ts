import { CipherDB } from "../libs/CipherDB.js";
import type { IBotModel, IDatabaseModel, IGroupModel, IUserModel } from "../types/DatabaseModel.js";
import { ObjectKeys } from "../utils/helpers.js";
import { paths } from "./paths.js";

const cipherdb = new CipherDB<IDatabaseModel>(paths.database);
cipherdb.load().then(async () => {
  if (!ObjectKeys(cipherdb.data).length) {
    cipherdb.data = {
      users: {},
      groups: {},
      bots: {},
    };
    await cipherdb.save();
  }
});
export const database = {
  users: {
    get: async (key: string): Promise<Nullable<IUserModel>> => {
      if (!cipherdb.data) {
        return null;
      }
      return cipherdb.data.users[key] ?? null;
    },
    set: async (key: string, value: IUserModel): Promise<boolean> => {
      if (!cipherdb.data || key in cipherdb.data.users) {
        return false;
      }
      cipherdb.data.users[key] = value;
      await cipherdb.save();
      return true;
    },
    update: async (key: string, value: Partial<IUserModel>): Promise<Nullable<IUserModel>> => {
      if (!cipherdb.data || !(key in cipherdb.data.users)) {
        return null;
      }
      cipherdb.data.users[key] = {
        ...(cipherdb.data.users[key])!,
        ...value,
      };
      await cipherdb.save();
      return cipherdb.data.users[key];
    },
    has: async (key: string): Promise<boolean> => {
      if (!cipherdb.data || !(key in cipherdb.data.users)) {
        return false;
      }
      return true;
    },
    del: async (key: string): Promise<boolean> => {
      if (!cipherdb.data || !(key in cipherdb.data.users)) {
        return false;
      }
      delete cipherdb.data.users[key];
      await cipherdb.save();
      return true;
    },
    keys: async (): Promise<string[]> => {
      if (!cipherdb.data) {
        return [];
      }
      return ObjectKeys(cipherdb.data.users);
    },
    entries: async (): Promise<[string, IUserModel][]> => {
      if (!cipherdb.data) {
        return [];
      }
      return Object.entries(cipherdb.data.users);
    },
  },
  groups: {
    get: async (key: string): Promise<Nullable<IGroupModel>> => {
      if (!cipherdb.data) {
        return null;
      }
      return cipherdb.data.groups[key] ?? null;
    },
    set: async (key: string, value: IGroupModel): Promise<boolean> => {
      if (!cipherdb.data || key in cipherdb.data.groups) {
        return false;
      }
      cipherdb.data.groups[key] = value;
      await cipherdb.save();
      return true;
    },
    update: async (key: string, value: Partial<IGroupModel>): Promise<Nullable<IGroupModel>> => {
      if (!cipherdb.data || !(key in cipherdb.data.groups)) {
        return null;
      }
      cipherdb.data.groups[key] = {
        ...(cipherdb.data.groups[key])!,
        ...value,
      };
      await cipherdb.save();
      return cipherdb.data.groups[key];
    },
    has: async (key: string): Promise<boolean> => {
      if (!cipherdb.data || !(key in cipherdb.data.groups)) {
        return false;
      }
      return true;
    },
    del: async (key: string): Promise<boolean> => {
      if (!cipherdb.data || !(key in cipherdb.data.groups)) {
        return false;
      }
      delete cipherdb.data.groups[key];
      await cipherdb.save();
      return true;
    },
    keys: async (): Promise<string[]> => {
      if (!cipherdb.data) {
        return [];
      }
      return ObjectKeys(cipherdb.data.groups);
    },
    entries: async (): Promise<[string, IGroupModel][]> => {
      if (!cipherdb.data) {
        return [];
      }
      return Object.entries(cipherdb.data.groups);
    },
  },
  bots: {
    get: async (key: string): Promise<Nullable<IBotModel>> => {
      if (!cipherdb.data) {
        return null;
      }
      return cipherdb.data.bots[key] ?? null;
    },
    set: async (key: string, value: IBotModel): Promise<boolean> => {
      if (!cipherdb.data || key in cipherdb.data.bots) {
        return false;
      }
      cipherdb.data.bots[key] = value;
      await cipherdb.save();
      return true;
    },
    update: async (key: string, value: Partial<IBotModel>): Promise<Nullable<IBotModel>> => {
      if (!cipherdb.data || !(key in cipherdb.data.bots)) {
        return null;
      }
      cipherdb.data.bots[key] = {
        ...(cipherdb.data.bots[key])!,
        ...value,
      };
      await cipherdb.save();
      return cipherdb.data.bots[key];
    },
    has: async (key: string): Promise<boolean> => {
      if (!cipherdb.data || !(key in cipherdb.data.bots)) {
        return false;
      }
      return true;
    },
    del: async (key: string): Promise<boolean> => {
      if (!cipherdb.data || !(key in cipherdb.data.bots)) {
        return false;
      }
      delete cipherdb.data.bots[key];
      await cipherdb.save();
      return true;
    },
    keys: async (): Promise<string[]> => {
      if (!cipherdb.data) {
        return [];
      }
      return ObjectKeys(cipherdb.data.bots);
    },
    entries: async (): Promise<[string, IBotModel][]> => {
      if (!cipherdb.data) {
        return [];
      }
      return Object.entries(cipherdb.data.bots);
    },
  },
  load: cipherdb.load,
  save: cipherdb.save,
  size: cipherdb.size,
};
