package abtest

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class BasicSimulation extends Simulation {

  val httpConf = http
    .baseURL("http://localhost:3000/api/1")
    .acceptHeader("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .doNotTrackHeader("1")
    .acceptLanguageHeader("en-US,en;q=0.5")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0")

  val testExecuteScn = scenario("ExecuteSimulation")
    .exec(http("test/execute")
    .post("/test/5936296ac3d49d3ca9171022/execute"))
    .pause(10)

  val testConvertScn = scenario("ConvertSimulation")
    .exec(http("test/convert")
    .post("/candidate/5936296ac3d49d3ca9171023/convert"))
    .pause(10)

  setUp(
    testExecuteScn.inject(rampUsers(5000) over (120 seconds)),
	testConvertScn.inject(rampUsers(5000) over (120 seconds))
  ).protocols(httpConf)
}
