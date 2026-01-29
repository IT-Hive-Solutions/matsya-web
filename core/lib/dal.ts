import 'server-only';
import { cookies } from 'next/headers';
import { readMe } from '@directus/sdk';
import { redirect } from 'next/navigation';
import { directus } from './directus';
import { IUser } from '../interfaces/user.interface';

export async function getUserData(formLogin?: boolean): Promise<{ success: boolean; user: IUser }> {
    try {
        console.log({ formLogin });

        const token = (await cookies()).get("directus_session_token")?.value;
        console.log({ token });

        if (!token) {
            redirect("/auth/login");
        }

        directus.setToken(token)
        const user: any = await directus.request(readMe({
            fields: ["*", "office_id.*" as any]
        }));


        return { success: true, user };
    } catch (error) {
        console.log(error);
        redirect("/auth/login");
    }
}

