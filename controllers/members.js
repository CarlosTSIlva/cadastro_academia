const fs = require("fs");
const data = require("../data.json");
const { date } = require("../utils");

exports.index = function (req, res) {
  return res.render("members/index", { members: data.members });
};

exports.show = function (req, res) {
  const { id } = req.params;
  const foundMember = data.members.find(function (member) {
    return member.id == id;
  });
  if (!foundMember) return res.send("instrutor nao existe");

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
  const member = {
    ...foundMember,
    age: age(foundMember.birth),
  };

  return res.render("members/show", { member });
};
exports.create = function (req, res) {
  return res.render("member/create");
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
  const id = Number(data.members.length + 1);

  data.members.push({
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
    return res.redirect(`/members/${id}`);
  });
};

//update
exports.edit = function (req, res) {
  const { id } = req.params;
  const foundMember = data.members.find(function (member) {
    return id == member.id;
  });

  if (!foundMember) return res.send("instrutosr nao existe");
  const member = {
    ...foundMember,
    birth: date(foundMember.birth),
  };

  return res.render("members/edit", { member });
};

let index = 0;
exports.put = function (req, res) {
  const { id } = req.body;
  const foundMember = data.members.find(function (member, foundIndex) {
    if (id == member.id) {
      index = foundIndex;
      return true;
    }
  });
  if (!foundMember) return res.send("member not found!");
  const member = {
    ...foundMember,
    ...req.body,
    birth: Date.parse(req.body.birth),
    id: Number(req.body.id),
  };
  data.members[index] = member;

  fs.writeFile("data.json", JSON.stringify(data, null, 2), function (err) {
    if (err) return res.send("write error!");
    return res.redirect(`/members/${id}`);
  });
};

//delete
exports.delete = function (req, res) {
  const { id } = req.body;
  const filteredMembers = data.members.filter(function (members) {
    return members.id != id;
  });

  data.members = filteredMembers;

  fs.writeFile("data.json", JSON.stringify(data, null, 2), function (err) {
    if (err) return res.send("write error");
    return res.redirect("/members");
  });
};
