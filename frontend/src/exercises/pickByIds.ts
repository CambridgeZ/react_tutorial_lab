export interface User {
  id: number;
  name: string;
  active: boolean;
}

/**
 * 从 users 里挑出 id 在 ids 里的、active 为 true 的用户，
 * 按 ids 给出的顺序返回他们的 name。
 *
 * 示例：
 *   users = [{id:1,name:'a',active:true},{id:2,name:'b',active:false},{id:3,name:'c',active:true}]
 *   ids = [3, 1, 2]
 *   返回 ['c', 'a']   （id=2 因为 active=false 被过滤掉）
 */
export function pickByIds(users: User[], ids: number[]): string[] {
    const userMap = users.reduce((acc, user) => {
        if (user.active){
            acc[user.id] = user.name;
        }
        return acc;
    }, {} as Record<number, string>);

    return ids.reduce((acc, id) => {
        if (userMap[id] != null) {
            acc.push(userMap[id]);
        }
        return acc;
    }, [] as string[]);
}
