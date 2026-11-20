/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>Built-in <b>EVEOnline</b> integration.</span>
 * <a href="https://eveonline.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/eveonline.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/eveonline
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface EVEOnlineProfile extends Record<string, any> {
  CharacterID: number
  CharacterName: string
  ExpiresOn: string
  Scopes: string
  TokenType: string
  CharacterOwnerHash: string
  IntellectualProperty: string
}

/**
 * Add EveOnline login to your page.
 *
 * ### Setup
 *
 * #### Callback URL
 * ```
 * https://example.com/api/auth/callback/eveonline
 * ```
 *
 * #### Configuration
 *```ts
 * import { Auth } from "@auth/core"
 * import EveOnline from "@auth/core/providers/eveonline"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     EveOnline({
 *       clientId: EVEONLINE_CLIENT_ID,
 *       clientSecret: EVEONLINE_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### Resources
 *
 *  - [EveOnline OAuth documentation](https://developers.eveonline.com/blog/article/sso-to-authenticated-calls)
 *
 * ### Notes
 *
 * :::tip
 * When creating your application, make sure to select `Authentication Only` as the connection type.
 * :::
 *
 * :::danger
 * `providerAccountId` is `CharacterOwnerHash`, not `CharacterID`. EVE characters can be
 * transferred/sold; `CharacterID` stays with the character while `CharacterOwnerHash` rotates to
 * the new owner. Using `CharacterID` would let a buyer sign into the previous owner's Auth.js
 * account ([ESI best practices](https://docs.esi.evetech.net/docs/best_practices.html)).
 * :::
 *
 * :::tip
 * If using JWT for the session, you can add the `CharacterID` to the JWT and session. Example:
 * ```ts
 * options: {
 *   jwt: {
 *     secret: process.env.JWT_SECRET,
 *   },
 *   callbacks: {
 *     session: async ({ session, token }) => {
 *       session.user.id = token.id;
 *       return session;
 *     }
 *   }
 * }
 * ```
 * :::
 * By default, Auth.js assumes that the EveOnline provider is
 * based on the [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) specification.
 *
 * :::tip
 *
 * The EveOnline provider comes with a [default configuration](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/eveonline.ts).
 * To override the defaults for your use case, check out [customizing a built-in OAuth provider](https://authjs.dev/guides/configuring-oauth-providers).
 *
 * :::
 *
 * :::info **Disclaimer**
 *
 * If you think you found a bug in the default configuration, you can [open an issue](https://authjs.dev/new/provider-issue).
 *
 * Auth.js strictly adheres to the specification and it cannot take responsibility for any deviation from
 * the spec by the provider. You can open an issue, but if the problem is non-compliance with the spec,
 * we might not pursue a resolution. You can ask for more help in [Discussions](https://authjs.dev/new/github-discussions).
 *
 * :::
 */
export default function EVEOnline<P extends EVEOnlineProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "eveonline",
    name: "EVE Online",
    type: "oauth",
    authorization:
      "https://login.eveonline.com/v2/oauth/authorize?scope=publicData",
    token: "https://login.eveonline.com/v2/oauth/token",
    userinfo: "https://login.eveonline.com/oauth/verify",
    checks: ["state"],
    profile(profile) {
      // CharacterOwnerHash changes when a character is transferred; CharacterID does not.
      // See https://docs.esi.evetech.net/docs/best_practices.html
      if (!profile.CharacterOwnerHash) {
        throw new TypeError(
          "EVE Online profile is missing CharacterOwnerHash; refusing to link by CharacterID"
        )
      }
      return {
        id: profile.CharacterOwnerHash,
        name: profile.CharacterName,
        email: null,
        image: `https://image.eveonline.com/Character/${profile.CharacterID}_128.jpg`,
      }
    },
    options,
  }
}
