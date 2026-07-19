

export async function seed(knex){


  await knex("users").insert([
    
    {
      email: "admin@gmail.com",
      password_hash: "$2b$10$q6FAzxOHDrxEhO3rTQRhtuKseX801qdUCSwGeD5yyn.LMQ9DHBsf2",
      role: "admin"
    },
    {
    
      email: "mike@gmail.com",
      password_hash: "$2b$10$q6FAzxOHDrxEhO3rTQRhtuKseX801qdUCSwGeD5yyn.LMQ9DHBsf2",
      role: "customer"
    }
   ,
        {

      email: "john.trainer@fitzone.com",
      password_hash: "$2b$10$q6FAzxOHDrxEhO3rTQRhtuKseX801qdUCSwGeD5yyn.LMQ9DHBsf2",
      role: "staff"
    },

  ]);

};