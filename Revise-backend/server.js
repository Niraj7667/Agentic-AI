import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  try {
    // const user = await prisma.user.create({
    //   data: {
    //     name: "niraj",
    //     email: "niraj@gmail.com",
    //   },
    // });

    // many user

    // const user = await prisma.user.createMany({
    //   data: [
    //     {name: "nil", email: "nil@gmail.com"},
    //     {name: "nitish", email: "nitish@gmail.com"},
    //   ],
    // });
    // console.log(user);

    //read
    // const users = await prisma.user.findUnique();
    // console.log(users);

    // const users = await prisma.user.findUnique({
    //     where: {id: 2},
    // });
    // console.log(users);

    // const users = await prisma.user.update({
    //     where: {id: 2},
    //     data : {name: "BobTheBuilder"}
    // });
    // console.log(users);

    const users = await prisma.user.delete({
        where: {id: 2},
       
    });
    console.log(users);

    
  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
