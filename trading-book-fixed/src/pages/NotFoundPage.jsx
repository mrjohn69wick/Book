import { Link } from 'wouter';
const NotFoundPage = () => (
  <div className="simple-page" style={{textAlign: 'center', padding: '80px 20px'}}>
    <h1 style={{fontSize: '4rem', marginBottom: '20px'}}>404</h1>
    <h2>Page Not Found</h2>
    <p>Sorry, the page you are looking for doesn't exist</p>
    <Link href="/"><a className="btn btn-primary" style={{marginTop: '20px', display: 'inline-block'}}>Go Home</a></Link>
  </div>
);
export default NotFoundPage;
