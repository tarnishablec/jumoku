export class Router {
  private static instance: Router
  static mode: 'hash' | 'history' = 'hash'

  private constructor() {}

  static getInstance() {
    return Router.instance ?? (Router.instance = new Router())
  }
}