import { Col, Row } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-container">
      
        <nav className="navbar navbar-expand-lg navbar-light home-navbar">
          <Link to="/" className="navbar-brand">Medicare</Link>
          <div>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
          </div>
        </nav>
      <Row>
        {<img src='doctor3.avif' className='doctor-image' ></img>}
        {<img src='mobile-image.avif' className='mobile-img' ></img>}
        <Col lg={12} sm={24} md={24}>
          
        </Col>
        <Col lg={12} sm={24} md={24}>
          <section className="jumbotron text-center">
          <h1 className="jubotron-heading">Welcome to Medicare</h1>
          <p className="lead-1">A solution to all your medical appointment related problems.</p>
          <p className="lead">Book your medical appointments with ease now.</p>
          <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
          </section>
        </Col>
      </Row>
     
    </div>
  );
};

export default HomePage;
