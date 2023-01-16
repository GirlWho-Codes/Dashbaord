import {
   Avatar,
   Button,
   FormControl,
   FormGroup,
   IconButton,
} from '@mui/material';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
   DataTable,
   LabelInput,
   Layout,
   Modals,
   SearchBox,
   SVG,
} from '../components';
import { tableSearch } from '../utils/tableSearch';
 
/**
 * This is a getServerSideProps function thats help fetch users from server before the page loads
 */
export async function getServerSideProps() {
   let status, adminData;
   try{
      const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;
      const deviceToken = process.env.NEXT_PUBLIC_DEVICE_TOKEN;

      const response = await axios.get (
         `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/admin/view-admins`,
         {
            headers: {
               
               Authorization: `Bearer ${bearerToken}`,
               "Device-Token": deviceToken
            }

         }
      );
      status = response.status;
      adminData = response.data?.data;
      console.log(response.data)
      console.log(response)

   } catch(error) {
         
            status= error.response?.status,
            adminData= null
            // data ={ data: error.response?.statusText },
            console.log(error)
      };
      
      return {
         props: {
            // status,
            adminData,
         },
      };
      
   
   
}

const Administrator = ({ status, adminData }) => {
   const [open, setOpen] = React.useState(false);
   const [firstName, setFirstName] = React.useState('Wale');
   const [lastName, setLastName] = React.useState('Andrew');
   const [phoneNumber, setPhoneNumber] = React.useState('08012345678');
   const [password, setPassword] = React.useState('111111111');
   const [role, setRole] = React.useState('1');
   const [fileOn, setFileOn] = useState(null);
   const [profilePic, setProfilePic] = React.useState('');
   const [email, setEmail] = React.useState('waleAn@gmail.com');
   const [gender, setGender] = React.useState('male');
   const [loading, setLoading] = React.useState(false);
   const [searchResult, setSearchResult] = useState([]);
   const searchTerm = useSelector((state) => state.searchTerm);
   

   const columns = React.useMemo(
      () => [
         {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ value }) => (
               <div className='flex justify-start items-center gap-2'>
                  <div className='h-[30px] w-[30px] lg:h-[50px] lg:w-[50px] relative'>
                     <Image
                        src={`/images/${value[1]}`}
                        alt={value[0]}
                        layout='fill'
                     />
                  </div>
                  <span>{value[0]}</span>
               </div>
            ),
         },
         {
            Header: 'Role',
            accessor: 'role',
         },
         {
            Header: 'Email',
            accessor: 'email',
         },
         {
            Header: 'Date Joined',
            accessor: 'dateJoined',
         },
      ],
      []
   );

   /**
    * Datagrid row data
    */
   let rows;
   console.log(adminData)
   // check if agentsData is an array
   if (typeof adminData === 'object' && Array.isArray(adminData) ) {
      rows = adminData?.map((item) => {
         return {
            name: [item.name, item.profile_photo],
            role: item.role.name,
            email: item.email,
            dateJoined: item.null, //'Today, 2:14pm',
         };
      });
   } else {
      rows = [];
   }
   console.log(rows)

   const handleClickOpen = () => {
      setOpen(true);
   };

   /** Function to handle create admin */
   const handleCreateAdmin = async () => {
      setLoading(true)
      // const {profilePic, formData} = handleUpload();
      const instance = axios.create({
         baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}`,
         
         headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_TOKEN}`,
            "device-token": `${process.env.NEXT_PUBLIC_DEVICE_TOKEN}`
         },
      }); 
      const formData = new FormData();
      
      formData.append("first_name", firstName)
      formData.append("last_name", lastName)
      formData.append("gender", gender)
      formData.append("phone_number", phoneNumber)
      formData.append("email", email)
      formData.append("password", password)
      formData.append("role_id", role)
      formData.append("profile_photo", fileOn)
   //  const data = { 
   //          first_name: firstName,
   //          last_name: lastName,
   //          gender,
   //          phone_number: phoneNumber,
   //          email,
   //          password: password,
   //          role_id: role,
   //          profile_photo,
   //       };
   try{
      await instance
       .post(`/api/v1/admin/register`, formData);
       setLoading(false)
       setOpen(false);
         console.log(response.data);   
          toast.success(response.data.data.message);
         
           return response;
          
   }catch(error){
          setLoading(false);
          setOpen(false);
          console.log(error);
          toast.error(error.response?.data.message);
          return error.response
          
       }; 
   
       
   };

   const handleUpload = (event) => {
      const file = event?.target.files[0];
      setFileOn(file)
         const reader = new FileReader();

         reader.onloaded = () => {
             setProfilePic(reader.result);
            
         }

         
         reader.onloadend = () => {
            reader.readAsDataURL(file)
           
        }

         reader.onerror = (error) => {
            console.log('Error reading this file:', error)
         }
     
         reader.readAsDataURL(file);

         console.log(profilePic);
         console.log(file)
         // return{profilePic, formData}
   };

   useEffect(() => {
      if (!searchTerm) return;

      const result = tableSearch({
         searchTerm,
         dataList: rows,
      });
      setSearchResult(result);
   }, [rows, searchTerm]);

   return (
      <Layout title='Administrator'>
         <div className='md:flex md:justify-between md:items-center mb-3 lg:mb-5'>
            <div>
               <h3 className='text-black-80 font-bold text-lg lg:text-2xl xl:text-[32px] tracking-[-0.05em] xl:leading-[48px]'>
                  System Administrators
               </h3>
               <p className='text-[#505780] text-xs sm:text-sm lg:text-base'>
                  Find all admins and associated roles
               </p>
            </div>
            <div className='flex items-center space-x-2.5 md:space-x-5'>
               <SearchBox />
               <Button
                  startIcon={<SVG.Add />}
                  className='bg-[#FFE6D6] text-[#FF4500] normal-case md:py-3 md:px-5 font-medium md:text-sm tracking-[-0.025em] hidden md:inline-flex rounded-lg'
                  onClick={handleClickOpen}
               >
                  Add New Admin
               </Button>
               <IconButton
                  onClick={handleClickOpen}
                  className='bg-[#FFE6D6] text-[#FF4500] normal-case py-1 px-2 text-[10px] font-medium tracking-[-0.025em] md:hidden rounded'
               >
                  <SVG.Add />
               </IconButton>
            </div>
         </div>

         <DataTable columns={columns} data={searchTerm ? searchResult : rows} />

         {/* Modal */}
         <Modals
            open={open}
            setOpen={setOpen}
            loading={loading}
            title='Add New Admin'
            buttonLabel='Add new admin'
            onClick={handleCreateAdmin}
         >
            <>
               <div className='flex'>
                  <div className='w-1/2 col-center'>
                     <input
                        accept='image/*'
                        style={{ display: 'none' }}
                        id='avatar-button-file'
                        type='file'
                        onChange={handleUpload}
                     />

                     <Avatar
                        sx={{
                           width: 80,
                           height: 80,
                           '& .MuiAvatar-img': {
                              objectPosition: 'top',
                           },
                        }}
                        src={profilePic}
                     />

                     <label htmlFor='avatar-button-file'>
                        <Button
                           variant='contained'
                           component='span'
                           className='mt-1 normal-case bg-orange text-white hover:bg-orange'
                           size='small'
                        >
                           Upload
                        </Button>
                     </label>
                  </div>
                  <div className='w-full'>
                     <LabelInput
                        label='First name'
                        placeholder='First name'
                        value={firstName}
                        setState={setFirstName}
                     />
                     <LabelInput
                        label='Last name'
                        placeholder='Last name'
                        value={lastName}
                        setState={setLastName}
                     />
                  </div>
               </div>

               <LabelInput
                  label='Phone Number'
                  type='tel'
                  placeholder='+2348012345678'
                  value={phoneNumber}
                  setState={setPhoneNumber}
               />

               <LabelInput
                  label='Email'
                  type='email'
                  placeholder='example@lifesaver.com'
                  value={email}
                  setState={setEmail}
               />
               <LabelInput
                  label='Gender'
                  combo
                  menuItems={['Male', 'Female']}
                  setState={setGender}
                  value={gender}
                  hasValue
               />
               <LabelInput
                  label='Role'
                  combo
                  menuItems={['Tester', 'Admin']}
                  setState={setRole}
                  value={role}
               />
               <LabelInput
                  label='Password'
                  type='password'
                  setState={setPassword}
                  value={password}
               />
            </>
         </Modals>
      </Layout>
   );
};

export default Administrator;

/* 
const [updateTransaction, setUpdateTransaction] = React.useState(false);
   const [editAmdmin, setEditAmdmin] = React.useState(false);
   const [addUser, setAddUser] = React.useState(false);
   const [disableUser, setDisableUser] = React.useState(false);
   const [enableUser, setEnableUser] = React.useState(false);


<>

               <LabelInput
                  label='Date of Birth'
                  value={dob}
                  setState={setDob}
                  type='date'
               />
               <LabelInput
                  label='Address'
                  placeholder='Address'
                  value={address}
                  setState={setAddress}
               />
                  <FormControl
                     fullWidth
                     sx={{ marginY: '24px' }}
                     component='fieldset'
                  >
                     <p className='text-[#9C9C9C] text-xs sm:text-sm'>
                        Privileges
                     </p>
                     <FormGroup>
                        <LabelInput
                           label='Update transactions'
                           checkbox
                           value={updateTransaction}
                           setState={setUpdateTransaction}
                        />
                        <LabelInput
                           label='Edit administrators'
                           checkbox
                           value={editAmdmin}
                           setState={setEditAmdmin}
                        />
                        <LabelInput
                           label='Add user'
                           checkbox
                           value={addUser}
                           setState={setAddUser}
                        />
                        <LabelInput
                           label='Enable User'
                           checkbox
                           value={enableUser}
                           setState={setEnableUser}
                        />
                        <LabelInput
                           label='Update transactions'
                           checkbox
                           value={disableUser}
                           setState={setDisableUser}
                        />
                     </FormGroup>
                  </FormControl>
               </>
 */
