Next.js reference overview
Clerk makes it simple to add authentication to your Next.js application. This documentation covers the capabilities and methods available from Clerk's Next.js SDK.

Guides
Read session and user data
Add custom sign up and sign in pages
Integrate Clerk into your app with tRPC
Client-side helpers
Because Clerk Next.js is a wrapper around Clerk React, you can utilize the hooks that Clerk React provides. These hooks give you access to the Clerk object, and a set of useful helper methods for signing in and signing up. You can learn more about these hooks in the React SDK reference.

useUser()
useClerk()
useAuth()
useSignIn()
useSignUp()
useSession()
useSessionList()
useOrganization()
useOrganizationList()
App router references
Clerk provides first-class support for the Next.js App Router. The below methods and references show how to integrate Clerk features into applications that take advantage of the latest App Router and React Server Components features.

auth()
currentUser()
Route Handlers
Server Actions
Pages router references
Clerk continues to provide drop-in support for the Next.js Pages Router. In addition to the main Clerk integration, several methods are available for instrumenting authentication within Pages Router-based applications.

getAuth()
buildClerkProps()
Other references
Auth object
Both auth() and getAuth() return an Auth object. This JavaScript object contains important information like session data, your user's ID, as well as their organization ID. Learn more about the Auth object here.

clerkMiddleware()
The clerkMiddleware() helper integrates Clerk authentication into your Next.js application through middleware. It allows you to integrate authorization into both the client and server of your application. You can learn more here.