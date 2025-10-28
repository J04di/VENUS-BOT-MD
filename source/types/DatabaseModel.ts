export interface IUserModel {
  lid: string;
  pn: string;
  nickname: string;
  isBanned: boolean;
  money: number;
}
export interface IGroupMainBotModel {
  lid: string;
  pn: string;
}
export interface IGroupModel {
  id: string;
  antiLinksOn: boolean;
  onlyAdminsOn: boolean;
  mainBot: IGroupMainBotModel;
}
export interface IBotOwnerModel {
  lid: string;
  pn: string;
}
export interface IBotModel {
  lid: string;
  pn: string;
  nickname: string;
  owner: IBotOwnerModel;
  id: string;
}
export interface IDatabaseModel {
  users: Record<string, IUserModel>;
  groups: Record<string, IGroupModel>;
  bots: Record<string, IBotModel>;
}
