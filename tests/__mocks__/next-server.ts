export class NextRequest {}
export class NextResponse {
  static json() { return new NextResponse(); }
  static redirect() { return new NextResponse(); }
  static next() { return new NextResponse(); }
}
export class NextURL {}