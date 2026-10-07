import {UserProvider} from '../../components/UserData';
export const metadata={robots:{index:false}};
export default function UserLayout({children}){return <UserProvider>{children}</UserProvider>}
