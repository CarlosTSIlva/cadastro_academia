const fs = require("fs");
const data = require("./data.json");
const { age, date } = require("./utils");
const { resolveSoa } = require("dns");

exports.show = function (req, res) {
  const { id } = req.params;
  const foundInstructor = data.instructors.find(function (instructor) {
    return instructor.id == id;
  });
  if (!foundInstructor) return res.send("instrutor nao existe");

  function age(timestamp) {
    const today = new Date();
    const birthDate = new Date(timestamp);

    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    if (month < 0 || (month == 0 && today.getDate < birthDate.getDate())) {
      age = age - 1;
    }

    return age;
  }
  const instructor = {
    ...foundInstructor,
    age: age(foundInstructor.birth),
    services: foundInstructor.services.split(","),
    created_at: new Intl.DateTimeFormat("pt-BR").format(
      foundInstructor.created_at
    ),
  };

  return res.render("instructors/show", { instructor });
};

exports.post = function (req, res) {
  const keys = Object.keys(req.body);
  for (key of keys) {
    if (req.body[key] == "") {
      return res.send("Tente novamente");
    }
  }
  let { avatar_url, birth, name, services, gender } = req.body;
  birth = Date.parse(birth);
  const created_at = Date.now();
  const id = Number(data.instructors.length + 1);

  data.instructors.push({
    id,
    name,
    avatar_url,
    birth,
    gender,
    services,
    created_at,
  });
  fs.writeFile("data.json", JSON.stringify(data, null, 2), function (err) {
    if (err) return res.send("seu arquivo comrrompeu");
    return res.redirect(`/instructors/${id}`);
  });
};

//update
exports.edit = function (req, res) {
  const { id } = req.params;
  const foundInstructor = data.instructors.find(function (instructor) {
    return id == instructor.id;
  });

  if (!foundInstructor) return res.send("instrutosr nao existe");
  const instructor = {
    ...foundInstructor,
    birth: date(foundInstructor.birth),
  };

  return res.render("instructors/edit", { instructor });
};
let index = 0;
exports.put = function (req, res) {
  const { id } = req.body;
  const foundInstructor = data.instructors.find(function (
    instructor,
    foundIndex
  ) {
    if (id == instructor.id) {
      index = foundIndex;
      return true;
    }
  });
  if (!foundInstructor) return res.send("instructor not found!");
  const instructor = {
    ...foundInstructor,
    ...req.body,
    birth: Date.parse(req.body.birth),
  };
  data.instructors[index] = instructor;

  fs.writeFile("data.json", JSON.stringify(data, null, 2), function (err) {
    if (err) return res.send("write error!");
    return res.redirect(`/instructors/${id}`);
  });
};
//delete
