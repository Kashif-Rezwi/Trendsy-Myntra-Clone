import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  CloseButton,
  useDisclosure,
  Button,
} from "@chakra-ui/react";

import { AiOutlineSearch } from "react-icons/ai";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiEdit } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { useThrottle } from "./usethrottle";

const Inventory = () => {
  const [data, setData] = useState();
  const [page, setPage] = useState(0);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [id, setID] = useState("");
  const [mrp, setMRP] = useState("");
  const [stock, setStock] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [update, setUpdate] = useState("");
  const [search, setSearch] = useState("");
  const [searchData, setsearchData] = useState([]);

  async function fetchData() {
    let res = await axios.get(
      `http://localhost:8080/data?limit=10&page=${page}`,
      {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("token")),
        },
      }
    );
    // console.log(res.data);
    setData(res.data);
  }

  let throttleValue = useThrottle(search, 2000);

  useEffect(() => {
    fetchData();
    handleQuery(throttleValue);
    if(searchData.length===0){
      setData([])
    }
  }, [page, throttleValue]);

  console.log(searchData);

  const DeleteProduct = (ID) => {
    fetch(`http://localhost:8080/data/${ID}`, {
      method: "DELETE",
      headers: {
        Authorization: JSON.parse(localStorage.getItem("token")),
      },
    }).then((res) => fetchData());
  };

  async function Update(id) {
    const payload = {
      title,
      mrp,
      stock,
    };
    let res = await axios.patch(`http://localhost:8080/data/${id}`, payload);
    fetchData();
    console.log(res);
  }

  const handleQuery = useCallback((search) => {
    if (search) {
      const url = `http://localhost:8080/data/search?q=${search}`;
      axios
        .get(url)
        .then((res) => {
          setsearchData(res.data);
        })
        .catch((err) => {
          console.log(err.message);
        });
    } else {
      setsearchData([]);
    }
  }, []);

  // console.log(search)

  return (
    <>
      <TableContainer fontSize={"14px"}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "235px",
                  }}
                >
                  <p style={{ display: show ? "none" : "flex" }}>Name</p>
                  {show ? (
                    <Input
                      type={"search"}
                      w={"280px"}
                      h={"20px"}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    ></Input>
                  ) : null}

                  <button onClick={() => setShow(true)}>
                    <AiOutlineSearch fontSize={15} mt={"-2px"} />
                  </button>
                  <button
                    onClick={() => setShow(false)}
                    style={{ display: show ? "flex" : "none" }}
                  >
                    <CloseButton fontSize={10} mt={"-2px"} ml={"14px"} />
                  </button>
                </div>
              </Th>

              <Th>PID</Th>
              <Th>MRP(INR)</Th>
              <Th>PRICE(INR)</Th>
              {/* <Th>BRAND</Th> */}
              <Th>CATEGORY</Th>
              <Th>STOCK</Th>
              <Th>Edit</Th>
              <Th>Delete</Th>
            </Tr>
          </Thead>

          {searchData &&
            searchData?.filter((e, i) => i <= 10)
              .map((ele) => (
                <>
                  <Tbody>
                    <Tr>
                      <Td fontSize={"12px"}>{ele.title.substring(0, 35)}</Td>
                      <Td>{ele.id}</Td>
                      <Td>{ele.variant_mrp}</Td>
                      <Td>{ele.variant_price}</Td>
                      <Td>{ele.ideal_for}</Td>
                      <Td>{ele.is_in_stock}</Td>
                      <Td>
                        <FiEdit
                          fontSize={15}
                          color={"#ff912e"}
                          onClick={() => {
                            onOpen();
                            setUpdate(ele._id);
                          }}
                        />
                      </Td>
                      <Button
                        onClick={() =>DeleteProduct(ele._id)}
                        w={10}
                        h={10}
                      >
                        <Td>
                          <MdDelete fontSize={15} color={"#f41cb2"} />
                        </Td>
                      </Button>
                    </Tr>
                  </Tbody>
                </>
              ))}

          { searchData.length===0 && data && data.map((ele) => (
              <>
                <Tbody>
                  <Tr>
                    <Td fontSize={"12px"}>{ele.title.substring(0, 35)}</Td>
                    <Td>{ele.id}</Td>
                    <Td>{ele.variant_mrp}</Td>
                    <Td>{ele.variant_price}</Td>
                    <Td>{ele.ideal_for}</Td>
                    <Td>{ele.is_in_stock}</Td>
                    <Td>
                      <FiEdit
                        fontSize={15}
                        color={"#ff912e"}
                        onClick={() => {
                          onOpen();
                          setUpdate(ele._id);
                        }}
                      />
                    </Td>
                    <Button
                      // onClick={() => DeleteProduct(ele._id)}
                      w={10}
                      h={10}
                    >
                      <Td>
                        <MdDelete fontSize={15} color={"#f41cb2"} />
                      </Td>
                    </Button>
                  </Tr>
                </Tbody>
              </>
            ))}
        </Table>
      </TableContainer>

      <Button onClick={() => setPage(page - 1)}>Previous</Button>
      <Button disabled>{page}</Button>
      <Button onClick={() => setPage(page + 1)}>Next</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Product Name"
              m={[3, 4, 5, 2]}
              onChange={(e) => setTitle(e.target.value)}
            ></Input>
            <Input
              placeholder="Product ID"
              m={[3, 4, 5, 2]}
              onChange={(e) => setID(e.target.value)}
            ></Input>
            <Input
              placeholder="MRP"
              m={[3, 4, 5, 2]}
              onChange={(e) => setMRP(e.target.value)}
            ></Input>
            <Input
              placeholder="Add in Stock"
              m={[3, 4, 5, 2]}
              onChange={(e) => setStock(e.target.value)}
            ></Input>
          </ModalBody>

          <ModalFooter justifyContent={"center"} alignItems={"center"}>
            <Button
              backgroundColor={"#ff912e"}
              color={"#f41cb2"}
              fontWeight={700}
              mr={3}
              onClick={() => {
                onClose();
                Update(update);
                // handleSubmit()
              }}
            >
              Update
            </Button>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Inventory;
