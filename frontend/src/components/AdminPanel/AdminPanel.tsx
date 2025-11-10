import {
  Box,
  Button,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogActionTrigger,
  DialogCloseTrigger,
  DialogBackdrop,
  DialogPositioner,
  IconButton,
  Input,
  Text,
  VStack,
  HStack,
  Flex,
  Tabs,
  Portal,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { MdBallot } from "react-icons/md";
import { FaTrash, FaCoins, FaUserShield } from "react-icons/fa";
import { adminApi, type User } from "../../api/admin/adminRequests";

const AdminPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [coinsAmount, setCoinsAmount] = useState<number>(0);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(
    null
  );
  const [newRole, setNewRole] = useState<string>("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  const handleAddCoins = async () => {
    if (!selectedUser) return;
    try {
      const updated = await adminApi.updateUserCoins(
        selectedUser.id,
        coinsAmount
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.id === updated.id ? { ...u, shilka_coins: updated.shilka_coins } : u
        )
      );
      setSelectedUser(null);
      setCoinsAmount(0);
    } catch (error) {
      console.error("Failed to add coins", error);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUserForRole || !newRole) return;
    try {
      const updated = await adminApi.updateUser(selectedUserForRole.id, {
        role: newRole,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === updated.id ? { ...u, role: updated.role } : u
        )
      );
      setSelectedUserForRole(null);
      setNewRole("");
    } catch (error) {
      console.error("Failed to change role", error);
    }
  };

  React.useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  return (
    <>
      <IconButton
        aria-label="Admin Panel"
        variant="ghost"
        size={{ base: "sm", md: "lg" }}
        color="textColor"
        _hover={{ color: "primaryColor", bg: "bgCardSecondaryColor" }}
        onClick={() => setOpen(true)}
      >
        <MdBallot />
      </IconButton>

      <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)} size="xl">
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent
              bg="bgCardColor"
              color="textColor"
              textStyle="input"
              borderColor="borderColor"
            >
              <DialogHeader>
                <DialogTitle
                  fontSize="2xl"
                  fontWeight="bold"
                  color="primaryColor"
                >
                  Админ-панель
                </DialogTitle>
              </DialogHeader>
              <DialogCloseTrigger />

              <DialogBody>
                <Tabs.Root defaultValue="users" variant="enclosed">
                  <Tabs.List bg="bgCardSecondaryColor" borderRadius="md" p={1}>
                    <Tabs.Trigger
                      value="users"
                      _selected={{ bg: "bgCardColor", color: "primaryColor" }}
                    >
                      Пользователи
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="sessions"
                      _selected={{ bg: "bgCardColor", color: "primaryColor" }}
                    >
                      Сессии
                    </Tabs.Trigger>
                  </Tabs.List>

                  <Tabs.Content value="users" pt={4}>
                    {loading ? (
                      <Text>Загрузка...</Text>
                    ) : (
                      <VStack
                        gap={3}
                        align="stretch"
                        maxH="400px"
                        overflowY="auto"
                      >
                        {users.map((user) => (
                          <Box
                            key={user.id}
                            p={3}
                            bg="bgCardSecondaryColor"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="borderColor"
                          >
                            <Flex justify="space-between" align="center">
                              <Box flex={1}>
                                <Text fontWeight="bold">{user.username}</Text>
                                <Text fontSize="sm" opacity={0.7}>
                                  ID: {user.id} | Роль: {user.role} | Монеты:{" "}
                                  {user.shilka_coins}
                                </Text>
                              </Box>
                              <HStack gap={2}>
                                <IconButton
                                  aria-label="Edit role"
                                  size="sm"
                                  variant="ghost"
                                  color="textColor"
                                  _hover={{
                                    color: "primaryColor",
                                    bg: "bgCardColor",
                                  }}
                                  onClick={() => {
                                    setSelectedUserForRole(user);
                                    setNewRole(user.role);
                                  }}
                                >
                                  <FaUserShield />
                                </IconButton>
                                <IconButton
                                  aria-label="Edit coins"
                                  size="sm"
                                  variant="ghost"
                                  color="textColor"
                                  _hover={{
                                    color: "primaryColor",
                                    bg: "bgCardColor",
                                  }}
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <FaCoins />
                                </IconButton>
                                <IconButton
                                  aria-label="Delete user"
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  _hover={{ bg: "red.900" }}
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <FaTrash />
                                </IconButton>
                              </HStack>
                            </Flex>
                          </Box>
                        ))}
                      </VStack>
                    )}
                  </Tabs.Content>

                  <Tabs.Content value="sessions" pt={4}>
                    <Text opacity={0.7}>
                      Функционал управления сессиями в разработке...
                    </Text>
                  </Tabs.Content>
                </Tabs.Root>
              </DialogBody>

              <DialogFooter>
                <DialogActionTrigger asChild>
                  <Button
                    variant="outline"
                    color="textColor"
                    _hover={{ bg: "bgCardSecondaryColor" }}
                  >
                    Закрыть
                  </Button>
                </DialogActionTrigger>
              </DialogFooter>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </DialogRoot>

      {/* Modal for adding coins */}
      <DialogRoot
        open={!!selectedUser}
        onOpenChange={(e) => !e.open && setSelectedUser(null)}
      >
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent bg="bgCardColor" color="textColor">
              <DialogHeader>
                <DialogTitle color="primaryColor">
                  Изменить монеты для {selectedUser?.username}
                </DialogTitle>
              </DialogHeader>
              <DialogCloseTrigger />
              <DialogBody>
                <VStack gap={3} align="stretch">
                  <Text fontSize="sm" opacity={0.8}>
                    Текущий баланс: {selectedUser?.shilka_coins}
                  </Text>
                  <Input
                    type="number"
                    placeholder="Введите количество монет (+ или -)"
                    value={coinsAmount}
                    onChange={(e) => setCoinsAmount(Number(e.target.value))}
                    bg="bgCardSecondaryColor"
                    borderColor="borderColor"
                    _focus={{ borderColor: "primaryColor" }}
                  />
                </VStack>
              </DialogBody>
              <DialogFooter gap={2}>
                <DialogActionTrigger asChild>
                  <Button variant="outline" color="textColor">
                    Отмена
                  </Button>
                </DialogActionTrigger>
                <Button
                  bg="primaryColor"
                  color="bgCardColor"
                  _hover={{ opacity: 0.8 }}
                  onClick={handleAddCoins}
                >
                  Применить
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </DialogRoot>

      {/* Modal for changing role */}
      <DialogRoot
        open={!!selectedUserForRole}
        onOpenChange={(e) => !e.open && setSelectedUserForRole(null)}
      >
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent bg="bgCardColor" color="textColor">
              <DialogHeader>
                <DialogTitle color="primaryColor">
                  Изменить роль для {selectedUserForRole?.username}
                </DialogTitle>
              </DialogHeader>
              <DialogCloseTrigger />
              <DialogBody>
                <VStack gap={3} align="stretch">
                  <Text fontSize="sm" opacity={0.8}>
                    Текущая роль: {selectedUserForRole?.role}
                  </Text>
                  <HStack gap={2} justify="center">
                    {["user", "moder", "admin"].map((role) => (
                      <Button
                        key={role}
                        size="sm"
                        variant={newRole === role ? "solid" : "outline"}
                        bg={newRole === role ? "primaryColor" : "transparent"}
                        color={newRole === role ? "bgCardColor" : "textColor"}
                        borderColor="borderColor"
                        _hover={{
                          bg:
                            newRole === role
                              ? "primaryColor"
                              : "bgCardSecondaryColor",
                          opacity: 0.8,
                        }}
                        onClick={() => setNewRole(role)}
                      >
                        {role === "user" && "User"}
                        {role === "moder" && "Moderator"}
                        {role === "admin" && "Admin"}
                      </Button>
                    ))}
                  </HStack>
                </VStack>
              </DialogBody>
              <DialogFooter gap={2}>
                <DialogActionTrigger asChild>
                  <Button variant="outline" color="textColor">
                    Отмена
                  </Button>
                </DialogActionTrigger>
                <Button
                  bg="primaryColor"
                  color="bgCardColor"
                  _hover={{ opacity: 0.8 }}
                  onClick={handleChangeRole}
                >
                  Применить
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </DialogRoot>
    </>
  );
};

export default AdminPanel;
