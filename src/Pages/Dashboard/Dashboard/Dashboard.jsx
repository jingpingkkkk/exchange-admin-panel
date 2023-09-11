import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Breadcrumb, Card, Col, Modal, Row } from "react-bootstrap";
import CountUp from "react-countup";
import { useLocation, useNavigate } from "react-router-dom";
import * as dashboard from "../../../data/dashboard/dashboard";
import { getTransactionCode } from "../../../lib/transaction-code";
import { getDashboardById } from "../dashboardService";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const newUser = location?.state?.newUser ?? false;
  const authUser = location?.state?.user ?? null;

  const { _id } = JSON.parse(localStorage.getItem("user_info")) || {};

  const [show, setShow] = useState(newUser);
  const [code, setCode] = useState("");

  const [balance, setBalance] = useState(0);
  const [exposure, setExposure] = useState(0);
  const [allPts, setAllPts] = useState(0);
  const [creditPts, setCreditPts] = useState(0);
  const [settlementPts, setSettlementPts] = useState(0);
  const [upPts, setUpPts] = useState(0);
  const [downPts, setDownPts] = useState(0);

  const dashboardGraph = {
    options: {
      chart: {
        type: "bar",
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: false,
        style: {
          colors: ["#000"],
        },
      },
      xaxis: {
        categories: ["Credit pts", "All pts", "Settlement pts", "Upper pts", "Down pts"],
        labels: {
          show: true,
          style: {
            colors: ["#000"],
          },
        },
      },
      colors: ["#556ee6", "#f1b44c", "#50a5f1", "#128412", "#343a40"], // Array of colors for each category
    },
    series: [
      {
        name: "Series-1",
        data: [creditPts, allPts, settlementPts, upPts, downPts],
      },
    ],
  };

  useEffect(() => {
    if (newUser) {
      setCode(getTransactionCode(authUser.transactionCode));
    }

    const fetchData = async () => {
      if (_id) {
        const response = await getDashboardById(_id);
        if (response.result && response.result.length > 0) {
          setBalance(response.result[0].balance);
          setExposure(response.result[0].totalExposure);
          setCreditPts(response.result[0].creditPoints);
          setAllPts(response.result[0].AllPts);
          setSettlementPts(response.result[0].settlementPoint);
          setUpPts(response.result[0].upPoint);
          setDownPts(response.result[0].downPoint);
        }
      }
    };
    fetchData();
    return () => {
      setCode("");
      setShow(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="page-header ">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item className="breadcrumb-item" href="#">
              Home
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-item active breadcrumds" aria-current="page">
              Dashboard
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <Row>
        <Col lg={12} md={12} sm={12} xl={12}>
          <Row>
            <Col lg={6} md={12} sm={12} xl={3}>
              <Card className=" overflow-hidden">
                <Card.Body className="card-body">
                  <Row>
                    <div className="col">
                      <h6 className="">Balance</h6>
                      <h3 className="mb-2 number-font">
                        <CountUp end={balance} separator="," start={0} duration={2.94} />
                      </h3>
                      {/* <p className="text-muted mb-0">
                        <span className="text-primary me-1">
                          <i className="fa fa-chevron-circle-up text-primary me-1"></i>
                          <span>3% </span>
                        </span>
                        last month
                      </p> */}
                    </div>
                    <div className="col col-auto">
                      <div className="counter-icon bg-primary-gradient box-shadow-primary brround ms-auto">
                        <i className="fe fe-trending-up text-white mb-5 "></i>
                      </div>
                    </div>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <div className="col-lg-6 col-md-12 col-sm-12 col-xl-3">
              <div className="card overflow-hidden">
                <div className="card-body">
                  <Row>
                    <div className="col">
                      <h6 className="">Exposure</h6>
                      <h3 className="mb-2 number-font">
                        <CountUp end={exposure} separator="," start={0} duration={2.94} />
                      </h3>
                      {/* <p className="text-muted mb-0">
                        <span className="text-secondary me-1">
                          <i className="fa fa-chevron-circle-up text-secondary me-1"></i>
                          <span>3% </span>
                        </span>
                        last month
                      </p> */}
                    </div>
                    <div className="col col-auto">
                      <div className="counter-icon bg-danger-gradient box-shadow-danger brround  ms-auto">
                        <i className="icon icon-rocket text-white mb-5 "></i>
                      </div>
                    </div>
                  </Row>
                </div>
              </div>
            </div>
            <Col lg={6} md={12} sm={12} xl={3}>
              <Card className="card overflow-hidden">
                <Card.Body className="card-body">
                  <Row>
                    <div className="col">
                      <h6 className="">Credit Pts</h6>
                      <h3 className="mb-2 number-font">
                        <CountUp end={creditPts} separator="," start={0} duration={2.94} />
                      </h3>
                      {/* <p className="text-muted mb-0">
                        <span className="text-success me-1">
                          <i className="fa fa-chevron-circle-down text-success me-1"></i>
                          <span>0.5% </span>
                        </span>
                        last month
                      </p> */}
                    </div>
                    <div className="col col-auto">
                      <div className="counter-icon bg-secondary-gradient box-shadow-secondary brround ms-auto">
                        <i className="fe fe-dollar-sign text-white mb-5 "></i>
                      </div>
                    </div>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6} md={12} sm={12} xl={3}>
              <Card className=" overflow-hidden">
                <Card.Body className="card-body">
                  <Row>
                    <div className="col">
                      <h6 className="">All Pts</h6>
                      <h3 className="mb-2 number-font">
                        <CountUp end={allPts} separator="," start={0} duration={2.94} />
                      </h3>
                      {/* <p className="text-muted mb-0">
                        <span className="text-danger me-1">
                          <i className="fa fa-chevron-circle-down text-danger me-1"></i>
                          <span>0.2% </span>
                        </span>
                        last month
                      </p> */}
                    </div>
                    <div className="col col-auto">
                      <div className="counter-icon bg-success-gradient box-shadow-success brround  ms-auto">
                        <i className="fe fe-briefcase text-white mb-5 "></i>
                      </div>
                    </div>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6} md={12} sm={12} xl={3}>
              <Card className=" overflow-hidden">
                <Card.Body className="card-body">
                  <Row>
                    <div className="col">
                      <h6 className="">Settlement Pts</h6>
                      <h3 className="mb-2 number-font">
                        <CountUp end={settlementPts} separator="," start={0} duration={2.94} />
                      </h3>
                      {/* <p className="text-muted mb-0">
                        <span className="text-danger me-1">
                          <i className="fa fa-chevron-circle-down text-danger me-1"></i>
                          <span>0.2% </span>
                        </span>
                        last month
                      </p> */}
                    </div>
                    <div className="col col-auto">
                      <div className="counter-icon bg-primary-gradient box-shadow-success brround  ms-auto">
                        <i className="fe fe-layers text-white mb-5 "></i>
                      </div>
                    </div>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6} md={12} sm={12} xl={3}>
              <Card className=" overflow-hidden">
                <Card.Body className="card-body">
                  <Row>
                    <div className="col">
                      <h6 className="">Upper Pts</h6>
                      <h3 className="mb-2 number-font">
                        <CountUp end={upPts} separator="," start={0} duration={2.94} />
                      </h3>
                      {/* <p className="text-muted mb-0">
                        <span className="text-danger me-1">
                          <i className="fa fa-chevron-circle-down text-danger me-1"></i>
                          <span>0.2% </span>
                        </span>
                        last month
                      </p> */}
                    </div>
                    <div className="col col-auto">
                      <div className="counter-icon bg-danger-gradient box-shadow-success brround  ms-auto">
                        <i className="fe fe-arrow-up text-white mb-5 "></i>
                      </div>
                    </div>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6} md={12} sm={12} xl={3}>
              <Card className=" overflow-hidden">
                <Card.Body className="card-body">
                  <Row>
                    <div className="col">
                      <h6 className="">Down Pts</h6>
                      <h3 className="mb-2 number-font">
                        <CountUp end={downPts} separator="," start={0} duration={2.94} />
                      </h3>
                      {/* <p className="text-muted mb-0">
                        <span className="text-danger me-1">
                          <i className="fa fa-chevron-circle-down text-danger me-1"></i>
                          <span>0.2% </span>
                        </span>
                        last month
                      </p> */}
                    </div>
                    <div className="col col-auto">
                      <div className="counter-icon bg-secondary-gradient box-shadow-success brround  ms-auto">
                        <i className="fe fe-arrow-down text-white mb-5 "></i>
                      </div>
                    </div>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
          <Card>
            {/* <Card.Header className="card-header">
              <h3 className="card-title">Total Transactions</h3>
            </Card.Header> */}
            <Card.Body className="card-body pb-0">
              <div id="chartArea" className="chart-donut">
                <ReactApexChart
                  options={dashboardGraph.options}
                  series={dashboardGraph.series}
                  type="bar"
                  height={300}
                />
              </div>
              <Row className="row5 align-self-center text-center">
                <Col xs={6} sm>
                  <p className="mb-2 font-size-11">
                    <i className="mdi mdi-circle align-middle font-size-10 me-2 text-primary"></i> Credit pts
                  </p>
                  <h5>{creditPts}</h5>
                </Col>
                <Col xs={6} sm>
                  <p className="mb-2 font-size-11">
                    <i className="mdi mdi-circle align-middle font-size-10 me-2 text-warning"></i> All pts
                  </p>
                  <h5>{allPts}</h5>
                </Col>
                <Col xs={4} sm>
                  <p className="mb-2 font-size-11">
                    <i className="mdi mdi-circle align-middle font-size-10 me-2 text-info"></i> Settlement pts
                  </p>
                  <h5>{settlementPts}</h5>
                </Col>
                <Col xs={4} sm>
                  <p className="mb-2 font-size-11">
                    <i className="mdi mdi-circle align-middle font-size-10 me-2 text-success"></i> Upper pts
                  </p>
                  <h5>{upPts}</h5>
                </Col>
                <Col xs={4} sm>
                  <p className="mb-2 font-size-11">
                    <i className="mdi mdi-circle align-middle font-size-10 me-2 text-dark"></i> Down pts
                  </p>
                  <h5>{downPts}</h5>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            {/* <Card.Header className="card-header">
              <h3 className="card-title">Total Transactions</h3>
            </Card.Header> */}
            <Card.Body className="card-body pb-0">
              <div id="chartArea" className="chart-donut">
                <ReactApexChart
                  options={dashboard.categoryWiseGraph.options}
                  series={dashboard.categoryWiseGraph.series}
                  type="bar"
                  height={300}
                />
              </div>
              <Row className="row5 align-self-center text-center">
                <Col xs={6} sm>
                  <p className="mb-2 font-size-11">
                    <i className="mdi mdi-circle align-middle font-size-10 me-2 text-primary"></i> Sports P/L
                  </p>
                  <h5>1,00,000</h5>
                </Col>
                <Col xs={6} sm>
                  <p className="mb-2 font-size-11">
                    <i className="mdi mdi-circle align-middle font-size-10 me-2 text-warning"></i> Casino P/L
                  </p>
                  <h5>1,00,000</h5>
                </Col>
                <Col xs={4} sm>
                  <p className="mb-2 font-size-11">
                    <i className="mdi mdi-circle align-middle font-size-10 me-2 text-info"></i> Tp Casino P/L
                  </p>
                  <h5>0</h5>
                </Col>
                <Col xs={4} sm>
                  <p className="mb-2 font-size-11">
                    <i className="mdi mdi-circle align-middle font-size-10 me-2 text-success"></i> Total P/L
                  </p>
                  <h5>0</h5>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
          <h1 className="page-title">Our Live Casino </h1>
        </Col>
      </Row>

      <Modal show={show} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Body className="text-center p-4">
          {/* <Button
            onClick={() => setShow(false)}
            className="btn-close"
            variant=""
          >
            x
          </Button> */}

          <i className="fe fe-check-circle fs-100 text-success lh-1 mb-4 d-inline-block"></i>
          <h4 className="text-success mb-4">Congratulations!</h4>
          <p className="mb-4 mx-4">Your password has been successfully updated.</p>
          <p className="mb-4 mx-4 h4">
            Your transaction password is : <b>{code}</b>
          </p>
          <p className="mb-4 mx-4">
            To ensure secure transactions on our website, it is essential that you remember and safeguard your
            transaction password. Going forward, all transactions on the website will require this password exclusively.
            It is of utmost importance that you do not disclose this password to anyone.
          </p>
          <p className="mb-4 mx-4">Thank You {authUser?.name}</p>

          <p className="mb-4 mx-4">आपका पासवर्ड सफलतापूर्वक अपडेट कर दिया गया है.</p>

          <p className="mb-4 mx-4">
            हमारी वेबसाइट पर सुरक्षित लेनदेन सुनिश्चित करने के लिए, यह आवश्यक है कि आप अपने लेनदेन पासवर्ड को याद रखें
            और सुरक्षित रखें। आगे चलकर, वेबसाइट पर सभी लेनदेन के लिए विशेष रूप से इस पासवर्ड की आवश्यकता होगी। यह अत्यंत
            महत्वपूर्ण है कि आप यह पासवर्ड किसी को न बताएं।
          </p>

          <p className="mb-4 mx-4">धन्यवाद</p>

          <button
            className="btn btn-success pd-x-25 "
            onClick={() => {
              navigate("/dashboard");
              setShow(false);
              window.location.reload();
            }}
          >
            Continue
          </button>
        </Modal.Body>
      </Modal>
    </div>

    // model pop up
  );
}
